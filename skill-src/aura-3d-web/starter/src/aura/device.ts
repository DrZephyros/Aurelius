import * as THREE from "three";
import type { Budget, DeviceReport } from "./contract";

/* ─────────────────────────────────────────────────────────────
   AURA · device.ts — a MEASURED device budget (replaces `w < 760 || pointer: coarse`).

   1. classify the GPU string (software rasteriser? Mali-4xx? Apple GPU? discrete?)
   2. cross-check deviceMemory / hardwareConcurrency
   3. run a ~100 ms calibration shader on the real GPU: a heavy fragment loop into a 512² target, synchronised with a 1-px readPixels,
      reported as ms per megapixel. The tier is the WORSE of (benchmark, hardware hints).
   4. turn the tier into a Budget the scene builds to. The live governor (engine.ts) keeps steering from there, up AND down.

   A narrow desktop window is NOT a weak device. A 2024 phone with an Apple GPU is NOT a weak device. A 4K desktop on an iGPU IS.
   ───────────────────────────────────────────────────────────── */

type Tier = "low" | "mid" | "high";
const SOFTWARE = /swiftshader|llvmpipe|software|basic render|softpipe|microsoft basic/i;
const WEAK_GPU = /mali-4|mali-t[0-7]|adreno \(tm\) [2-4]\d\d|adreno 3|powervr sgx|vivante|videocore|intel.*(hd graphics [2-4]\d{3}|gma)/i;
const STRONG_GPU = /apple (m\d|gpu)|rtx|radeon rx|geforce gtx|arc a|adreno \(tm\) (7|8)\d\d|mali-g(7|9)\d|xclipse/i;

function gpuString(gl: WebGLRenderingContext | WebGL2RenderingContext): string {
  try {
    const dbg = gl.getExtension("WEBGL_debug_renderer_info");
    return dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : String(gl.getParameter(gl.RENDERER));
  } catch { return "unknown"; }
}

/** Heavy-but-honest fragment loop. ~1.1k flops / pixel: a 1 TFLOP phone GPU lands near 1.2 ms/MP, a desktop dGPU well under 0.4. */
const BENCH_FS = /* glsl */ `
  varying vec2 vUv; uniform float uSeed;
  void main(){
    vec2 p = vUv * 6. + uSeed; float a = 0.;
    for (int i = 0; i < 48; i++) { p = vec2(sin(p.y * 1.7 + a), cos(p.x * 1.3 - a)) * 1.9 + p * .31; a += dot(p, p) * .013; }
    gl_FragColor = vec4(fract(a), fract(a * 3.1), fract(a * 7.3), 1.);
  }`;

function benchmark(renderer: THREE.WebGLRenderer): number | null {
  try {
    const rt = new THREE.WebGLRenderTarget(512, 512, { depthBuffer: false });
    const mat = new THREE.ShaderMaterial({ uniforms: { uSeed: { value: 0 } }, vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }", fragmentShader: BENCH_FS, depthTest: false, depthWrite: false });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    const scn = new THREE.Scene(); scn.add(quad);
    const cam = new THREE.Camera();
    const gl = renderer.getContext();
    const px = new Uint8Array(4);
    const prev = renderer.getRenderTarget();
    const run = (n: number) => {
      const t0 = performance.now();
      for (let i = 0; i < n; i++) {
        mat.uniforms.uSeed.value = i * 0.37;
        renderer.setRenderTarget(rt); renderer.render(scn, cam);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); // forces the GPU to finish → wall-clock = GPU time
      }
      return (performance.now() - t0) / n;
    };
    run(2); // shader compile + warm-up
    const first = run(1);
    const ms = first > 90 ? first : Math.min(first, run(5)); // a CPU rasteriser: do not spend a second proving it
    renderer.setRenderTarget(prev);
    rt.dispose(); mat.dispose(); quad.geometry.dispose();
    return ms / ((512 * 512) / 1e6);
  } catch { return null; }
}

export const BUDGETS: Record<Tier, (coarse: boolean) => Budget> = {
  high: (coarse) => ({ dpr: coarse ? 2 : 1.75, msaa: coarse ? 2 : 4, particles: 1, splats: 180_000, sdfSteps: 72, fx: { ao: true, dof: true, bloom: true, probe: true, audio: true } }),
  mid: (coarse) => ({ dpr: coarse ? 1.5 : 1.5, msaa: 2, particles: 0.6, splats: 70_000, sdfSteps: 52, fx: { ao: true, dof: true, bloom: true, probe: true, audio: true } }),
  low: () => ({ dpr: 1, msaa: 0, particles: 0.28, splats: 20_000, sdfSteps: 36, fx: { ao: false, dof: false, bloom: true, probe: false, audio: true } }),
};

export function measureDevice(renderer: THREE.WebGLRenderer, o: { coarse: boolean; forceTier?: Tier }): { report: DeviceReport; budget: Budget } {
  const gl = renderer.getContext();
  const name = gpuString(gl);
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memoryGB = nav.deviceMemory ?? null;
  const software = SOFTWARE.test(name);
  const reasons: string[] = [];
  let tier: Tier = "high";
  let source: DeviceReport["source"] = "heuristic";
  let gpuMsPerMP: number | null = null;
  const demote = (to: Tier, why: string) => { const r = { low: 0, mid: 1, high: 2 }; if (r[to] < r[tier]) tier = to; reasons.push(why); };

  if (o.forceTier) { tier = o.forceTier; reasons.push(`forced ${o.forceTier}`); }
  else if (software) { tier = "low"; source = "software"; reasons.push(`CPU rasteriser (${name})`); }
  else {
    if (WEAK_GPU.test(name)) demote("low", `weak GPU class (${name})`);
    else if (!STRONG_GPU.test(name) && o.coarse) demote("mid", `unrecognised mobile GPU (${name})`);
    if (memoryGB !== null && memoryGB <= 2) demote("low", `${memoryGB}GB RAM`);
    else if (memoryGB !== null && memoryGB <= 4 && o.coarse) demote("mid", `${memoryGB}GB RAM phone`);
    if (cores <= 2) demote("low", `${cores} cores`); else if (cores <= 4 && o.coarse) demote("mid", `${cores} cores`);
    gpuMsPerMP = benchmark(renderer);
    if (gpuMsPerMP !== null) {
      source = "benchmark";
      if (gpuMsPerMP > 14) demote("low", `benchmark ${gpuMsPerMP.toFixed(1)} ms/MP`);
      else if (gpuMsPerMP > 4.5) demote("mid", `benchmark ${gpuMsPerMP.toFixed(1)} ms/MP`);
      else reasons.push(`benchmark ${gpuMsPerMP.toFixed(2)} ms/MP`);
    } else reasons.push("benchmark unavailable → heuristics only");
  }
  const budget = BUDGETS[tier](o.coarse);
  return { report: { tier, gpuMsPerMP, source, renderer: name, software, cores, memoryGB, reasons }, budget };
}
