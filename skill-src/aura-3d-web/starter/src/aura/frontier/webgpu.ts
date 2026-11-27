/* ─────────────────────────────────────────────────────────────
   AURA · frontier/webgpu.ts — the WebGPU / TSL TRACK. Separate renderer, deliberately NOT wired into engine.ts.

   Why separate: WebGPURenderer cannot run the WebGL post stack, RawShaderMaterial or the splat/SDF shaders. Treat WebGPU as a *progressive upgrade
   for a single hero system* (compute particles / a fluid / a million-instance field), never as the base renderer, until your analytics say
   >90 % of the audience has it. Import this file dynamically so the 'three/webgpu' chunk is only fetched where it works.

   STATUS (be honest in your own report): type-checked and built in CI; executed only where an adapter exists. Headless SwiftShader has none, so
   the audit marks the WebGPU lab "not runtime-verified" instead of passing it.

     const gpu = await probeWebGPU();                       // { ok, adapter }
     if (gpu.ok) { const lab = await createComputeField(host, { count: 262_144 }); … lab.dispose(); } else mountWebGLFallback();
   ───────────────────────────────────────────────────────────── */

export async function probeWebGPU(): Promise<{ ok: boolean; reason?: string; adapter?: string }> {
  const nav = navigator as Navigator & { gpu?: { requestAdapter(): Promise<{ info?: { description?: string; vendor?: string } } | null> } };
  if (!nav.gpu) return { ok: false, reason: "navigator.gpu missing" };
  try {
    const a = await nav.gpu.requestAdapter();
    return a ? { ok: true, adapter: a.info?.description || a.info?.vendor || "adapter" } : { ok: false, reason: "no adapter" };
  } catch (e) { return { ok: false, reason: String(e) }; }
}

/** 262 k compute-simulated particles in TSL: one storage buffer, one compute node, zero CPU per particle. */
export async function createComputeField(host: HTMLElement, o: { count?: number; color?: number } = {}) {
  // TSL's published typings lag the runtime (storage buffers, .compute()) — typed loosely on purpose; the runtime API is stable since r17x.
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const THREE: any = await import("three/webgpu");
  const T: any = await import("three/tsl");
  const count = o.count ?? 262_144;
  const renderer = new THREE.WebGPURenderer({ antialias: true, alpha: false });
  await renderer.init();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(host.clientWidth, host.clientHeight);
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x05060a);
  const camera = new THREE.PerspectiveCamera(50, host.clientWidth / host.clientHeight, 0.1, 100); camera.position.set(0, 0, 9);

  const positions = T.instancedArray(count, "vec3"), velocities = T.instancedArray(count, "vec3");
  const dt = T.uniform(1 / 60), pull = T.uniform(0.6);
  const init = T.Fn(() => {
    const i = T.float(T.instanceIndex);
    positions.element(T.instanceIndex).assign(T.vec3(T.hash(i), T.hash(i.add(1.7)), T.hash(i.add(3.3))).sub(0.5).mul(9));
    velocities.element(T.instanceIndex).assign(T.vec3(0));
  })().compute(count);
  const update = T.Fn(() => {
    const p = positions.element(T.instanceIndex), v = velocities.element(T.instanceIndex);
    const flow = T.mx_noise_vec3(p.mul(0.35).add(T.time.mul(0.12))).mul(2.2);
    v.assign(v.mul(0.96).add(flow.mul(dt)).sub(p.mul(pull.mul(dt).mul(0.08))));
    p.addAssign(v.mul(dt));
  })().compute(count);

  const mat = new THREE.SpriteNodeMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
  mat.positionNode = positions.toAttribute();
  mat.scaleNode = T.float(0.012);
  mat.colorNode = T.vec3(new THREE.Color(o.color ?? 0x7fd6ff)).mul(T.float(0.55));
  const sprite = new THREE.Sprite(mat); (sprite as unknown as { count: number }).count = count; sprite.frustumCulled = false; scene.add(sprite);

  await renderer.computeAsync(init);
  let raf = 0;
  const loop = () => { raf = requestAnimationFrame(loop); renderer.compute(update); camera.position.x = Math.sin(performance.now() / 6000) * 3; camera.lookAt(0, 0, 0); renderer.render(scene, camera); };
  loop();
  const ro = new ResizeObserver(() => { renderer.setSize(host.clientWidth, host.clientHeight); camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix(); });
  ro.observe(host);
  return { renderer, dispose() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); renderer.domElement.remove(); } };
}
