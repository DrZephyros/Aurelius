import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { clamp, damp, ease } from "./choreo";
import { measureDevice } from "./device";
import { DepthPrepass, createAoPass, createDofPass } from "./post";
import type { AuraHandle, AuraInfo, AuraOptions, Builder, Frame, Shot, V3 } from "./contract";

export * from "./contract";

/* ─────────────────────────────────────────────────────────────
   AURA · engine.ts — the cinematic runtime (reference host of the portable contract in contract.ts).

   · The camera rides a keyframed SHOT LIST (position + look-at + fov + roll), Catmull-Rom smoothed. `at` ∈ [0,1] = PACING.
   · Scroll progress is the playhead, critically damped. Velocity kicks the FOV, fringes the lens and banks the horizon.
   · MEASURED device budget (device.ts) → tier + Budget; a BIDIRECTIONAL governor then steers pixel-ratio and drops fx (ao → dof → bloom) under load
     and gives them back when the device proves it can hold 55 fps.
   · Post: RenderPass → depth pre-pass → AO → bokeh DOF → bloom → tonemap → grade/grain/vignette/aberration.
   · REDUCED MOTION is real: ambient time is frozen (Frame.time == 0), parallax/idle sway/FOV kick/grain animation are off, and the canvas only
     re-renders when the playhead moves. The audit verifies two frames a second apart are identical.
   · `?tier=low|mid|high` forces a tier (QA, support). `?aura-debug=1` shows a live budget/fps card — use it on real phones.
   ───────────────────────────────────────────────────────────── */

const FX = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uFade: { value: 0 },
    uDim: { value: 0 },
    uVel: { value: 0 },
    uVignette: { value: 0.65 },
    uGrain: { value: 0.045 },
    uAberr: { value: 0.018 },
    uContrast: { value: 1.06 },
    uSat: { value: 1.05 },
    uShadows: { value: new THREE.Vector3(0, 0.02, 0.06) },
    uHighlights: { value: new THREE.Vector3(0.06, 0.03, 0) },
  },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
  fragmentShader: /* glsl */ `
    varying vec2 vUv; uniform sampler2D tDiffuse;
    uniform float uTime, uFade, uDim, uVel, uVignette, uGrain, uAberr, uContrast, uSat;
    uniform vec3 uShadows, uHighlights;
    float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    void main(){
      vec2 c = vUv - .5; float d = dot(c, c);
      vec2 off = c * (d * uAberr + uVel * .0028);
      vec3 col = vec3(texture2D(tDiffuse, vUv + off).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - off).b);
      float l = dot(col, vec3(.2126, .7152, .0722));
      col = mix(vec3(l), col, uSat);
      col = (col - .5) * uContrast + .5;
      col += uShadows * (1. - smoothstep(0., .5, l)) + uHighlights * smoothstep(.5, 1., l);
      col *= 1. - smoothstep(.10, .55, d) * uVignette;
      col += (hash(vUv * vec2(1920., 1080.) + fract(uTime) * 91.) - .5) * uGrain;
      gl_FragColor = vec4(max(col, 0.) * uFade * (1. - uDim * .5), 1.);
    }`,
};

type Ease = NonNullable<Shot["ease"]>;
const EASES: Record<Ease, (t: number) => number> = { linear: ease.linear, inOut: ease.inOutCubic, out: ease.outCubic };

/** uniform Catmull-Rom between b and c, with a/d as neighbours */
const cr = (a: number, b: number, c: number, d: number, t: number) =>
  0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);

function sampleRail(shots: Shot[], p: number, pos: THREE.Vector3, look: THREE.Vector3, baseFov: number) {
  const n = shots.length;
  let i = 0;
  while (i < n - 2 && p >= shots[i + 1].at) i++;
  const s1 = shots[i], s2 = shots[Math.min(i + 1, n - 1)];
  const s0 = shots[Math.max(i - 1, 0)], s3 = shots[Math.min(i + 2, n - 1)];
  const span = Math.max(1e-5, s2.at - s1.at);
  const t = EASES[s1.ease ?? "linear"](clamp((p - s1.at) / span));
  pos.set(cr(s0.pos[0], s1.pos[0], s2.pos[0], s3.pos[0], t), cr(s0.pos[1], s1.pos[1], s2.pos[1], s3.pos[1], t), cr(s0.pos[2], s1.pos[2], s2.pos[2], s3.pos[2], t));
  look.set(cr(s0.look[0], s1.look[0], s2.look[0], s3.look[0], t), cr(s0.look[1], s1.look[1], s2.look[1], s3.look[1], t), cr(s0.look[2], s1.look[2], s2.look[2], s3.look[2], t));
  const f1 = s1.fov ?? baseFov, f2 = s2.fov ?? baseFov;
  const r1 = s1.roll ?? 0, r2 = s2.roll ?? 0;
  return { fov: f1 + (f2 - f1) * t, roll: r1 + (r2 - r1) * t };
}

export async function mountAura(host: HTMLElement, build: Builder, opts: AuraOptions = {}): Promise<AuraHandle> {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
  const coarse = matchMedia("(pointer: coarse)").matches;
  const mobile = w < 760 || coarse; // LAYOUT hint only. Budgets come from the measured device below.
  const qs = new URLSearchParams(location.search);
  const urlTier = qs.get("tier") as "low" | "mid" | "high" | null;

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance", stencil: false });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.info.autoReset = false; // the composer renders several passes per frame — we reset once per frame so info() reports the whole frame
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
  host.appendChild(renderer.domElement);

  const { report: device, budget: B } = measureDevice(renderer, { coarse, forceTier: opts.forceTier ?? (urlTier && ["low", "mid", "high"].includes(urlTier) ? urlTier : undefined) });
  const tier = device.tier, software = device.software;
  const maxDpr = Math.min(devicePixelRatio || 1, opts.maxDpr ?? B.dpr);

  let quality = tier === "high" ? 1 : tier === "mid" ? 0.9 : 0.8; // the governor moves from here — down under load, back up when it is safe
  let qCeil = 1;
  const dprFor = (q: number) => Math.max(0.75, maxDpr * (0.6 + 0.4 * q));
  let dpr = dprFor(quality);
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const built = await build({ renderer, env, mobile, portrait: w / h < 0.85, coarse, tier, budget: B, device, reduced, quality });
  renderer.toneMappingExposure = built.exposure ?? 1;
  const baseFov = built.fov ?? 40;
  const camera = new THREE.PerspectiveCamera(baseFov, w / h, 0.1, 2000);
  const mode = built.mode ?? "dark";

  // MSAA on the scene pass (half-float so HDR survives to the bloom + grade). CPU rasterisers get none: it would make every frame seconds long.
  const msaa = software ? 0 : B.msaa;
  const target = new THREE.WebGLRenderTarget(Math.max(1, Math.round(w * dpr)), Math.max(1, Math.round(h * dpr)), { type: THREE.HalfFloatType, samples: renderer.capabilities.isWebGL2 ? msaa : 0 });
  const composer = new EffectComposer(renderer, target);
  composer.setPixelRatio(dpr);
  composer.setSize(w, h);
  composer.addPass(new RenderPass(built.scene, camera));
  const wantsDepth = !!(built.post?.ao || built.post?.dof);
  const depth = wantsDepth ? new DepthPrepass(built.scene, camera, 0.5) : null;
  const ao = depth && built.post?.ao ? createAoPass(depth.texture, tier === "high" ? 14 : 8) : null;
  const dof = depth && built.post?.dof ? createDofPass(depth.texture, tier === "high" ? 30 : 18) : null;
  if (depth) composer.addPass(depth);
  if (ao) composer.addPass(ao);
  if (dof) composer.addPass(dof);
  const b = built.bloom ?? { strength: 0.6, radius: 0.7, threshold: 0.85 };
  const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), b.strength, b.radius, b.threshold);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const fx = new ShaderPass(FX);
  composer.addPass(fx);
  const g = built.grade ?? {};
  const U = fx.uniforms as typeof FX.uniforms;
  if (g.vignette !== undefined) U.uVignette.value = g.vignette;
  if (g.grain !== undefined) U.uGrain.value = g.grain;
  if (g.aberration !== undefined) U.uAberr.value = g.aberration;
  if (g.contrast !== undefined) U.uContrast.value = g.contrast;
  if (g.saturation !== undefined) U.uSat.value = g.saturation;
  if (g.shadows) U.uShadows.value.set(...g.shadows);
  if (g.highlights) U.uHighlights.value.set(...g.highlights);
  if (reduced) { U.uGrain.value *= 0.5; U.uAberr.value = 0; }

  const S = { locked: false, target: 0, prog: 0, dim: 0, dimT: 0, fade: 0, speed: 0, bank: 0, ptrX: 0, ptrY: 0, tx: 0, ty: 0 };
  const onMove = (e: PointerEvent) => { if (e.pointerType === "touch" || reduced) return; /* a finger drives the scroll, not the parallax */ S.tx = (e.clientX / innerWidth) * 2 - 1; S.ty = (e.clientY / innerHeight) * 2 - 1; };
  addEventListener("pointermove", onMove, { passive: true });

  let dirty = 3; // frames still owed to the screen (reduced motion renders on demand)
  const live = { ao: false, dof: false, bloom: true };
  const applyQuality = () => {
    dpr = dprFor(quality);
    renderer.setPixelRatio(dpr);
    composer.setPixelRatio(dpr);
    renderer.setSize(w, h);
    composer.setSize(w, h);
    live.bloom = B.fx.bloom && quality > 0.45;
    live.ao = !!ao && B.fx.ao && quality >= 0.7;
    live.dof = !!dof && B.fx.dof && quality >= 0.55;
    bloom.enabled = live.bloom;
    if (ao) ao.enabled = live.ao;
    if (dof) dof.enabled = live.dof;
    if (depth) depth.enabled = live.ao || live.dof;
    dirty = 3;
  };
  let rail: Shot[] = built.shots, railName: "desktop" | "mobile" = "desktop", fit = 1;
  const lift = built.portraitLift ?? 0.11;
  const resize = () => {
    w = host.clientWidth || innerWidth; h = host.clientHeight || innerHeight;
    renderer.setSize(w, h); composer.setSize(w, h);
    camera.aspect = w / h;
    const portrait = w / h < 0.85;
    railName = portrait && built.shotsMobile ? "mobile" : "desktop";
    rail = railName === "mobile" ? built.shotsMobile! : built.shots;
    // portrait: lift the picture so the subject sits above the copy zone (a view offset — no scene changes needed)
    if (portrait && lift > 0) camera.setViewOffset(w, h, 0, Math.round(lift * h), w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    dirty = 3;
  };
  applyQuality();
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(host);

  const listeners = new Set<(f: Frame) => void>();
  const pos = new THREE.Vector3(), look = new THREE.Vector3(), prev = new THREE.Vector3();
  const right = new THREE.Vector3();
  let last = performance.now(), elapsed = 0; // (THREE.Clock is deprecated in recent three)
  let raf = 0, running = true, first = true, frames = 0, acc = 0, fps = 60, ema = 1 / 60;
  const times: number[] = []; // last 240 frame times (ms) for perf() — real-device telemetry
  let calm = 0, cool = 0, lastUp = -99, windowNo = 0;
  for (const [name, list] of [["shots", built.shots], ["shotsMobile", built.shotsMobile]] as const) {
    if (!list) continue;
    if (list[0].at !== 0 || list[list.length - 1].at !== 1) console.warn(`[aura] ${name} should start at 0 and end at 1 (got ${list[0].at} → ${list[list.length - 1].at}). The camera freezes outside the rail.`);
  }
  const fitFor = (aspect: number, strength: number) => (aspect >= 1.2 || strength <= 0 ? 1 : Math.min(2.2, Math.pow(1.5 / aspect, 0.85 * strength)));
  const dbg = qs.has("aura-debug") ? Object.assign(document.createElement("pre"), { style: "position:fixed;z-index:99;left:8px;top:8px;margin:0;padding:8px 10px;font:11px/1.35 ui-monospace,monospace;color:#9ff;background:#000c;border-radius:8px;pointer-events:none;white-space:pre" }) : null;
  if (dbg) document.body.appendChild(dbg);
  let dbgAt = 0;

  const frame = () => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    const raw = (now - last) / 1000;
    last = now;
    if (document.hidden || !visible) return;
    const dt = Math.min(raw, 0.05);
    if (!reduced) elapsed += dt; // reduced motion: ambient time never advances
    const t = elapsed;
    times.push(raw * 1000); if (times.length > 240) times.shift();

    // ── bidirectional governor. Down fast (one slow window), up slow (4 calm windows, then a cool-down), never above a ceiling that already flapped.
    if (++frames > 90 && !reduced) {
      acc += raw;
      if ((frames - 90) % 45 === 0) {
        windowNo++;
        const avg = acc / 45; acc = 0;
        if (avg > 1 / 38 && quality > 0.2) {
          if (windowNo - lastUp < 14) qCeil = Math.min(qCeil, quality - 0.1); // we stepped up and it did not hold → stop trying that level
          quality = Math.max(0.2, quality - 0.2); calm = 0; cool = 6; applyQuality();
        } else if (avg < 1 / 54) {
          if (cool > 0) cool--; else if (++calm >= 4 && quality < Math.min(1, qCeil)) { quality = Math.min(qCeil, quality + 0.1); calm = 0; lastUp = windowNo; applyQuality(); }
        } else calm = 0;
      }
    }

    ema += (raw - ema) * 0.05; fps = Math.round(1 / Math.max(ema, 1e-3));
    if (!S.locked && opts.progress) S.target = clamp(opts.progress());
    const before = S.prog;
    S.prog = first || S.locked ? S.target : damp(S.prog, S.target, reduced ? 20 : 3.2, dt);
    if (S.locked) { S.fade = 1; S.tx = S.ty = S.ptrX = S.ptrY = 0; }
    const dimBefore = S.dim;
    S.dim = damp(S.dim, S.dimT, 2.4, dt);
    S.fade = reduced ? 1 : Math.min(1, S.fade + dt * 0.8);
    S.ptrX = damp(S.ptrX, S.tx, 2.4, dt);
    S.ptrY = damp(S.ptrY, S.ty, 2.4, dt);
    const vel = dt > 0 && !S.locked ? Math.abs(S.prog - before) / dt : 0;
    S.speed = reduced ? 0 : damp(S.speed, vel, 4, dt);
    if (reduced) {
      // on-demand rendering: nothing moved → nothing is drawn (no ambient motion, no wasted battery)
      if (Math.abs(S.prog - before) > 1e-5 || Math.abs(S.dim - dimBefore) > 1e-4) dirty = Math.max(dirty, 2);
      if (dirty <= 0) return;
      dirty--;
    }

    const p = clamp(S.prog, 0, 0.9999);
    prev.copy(pos);
    // touch devices have no cursor → a slow idle sway keeps parallax alive without fighting the thumb
    if (coarse && !S.locked && !reduced) { S.tx = Math.sin(t * 0.35) * 0.5; S.ty = Math.cos(t * 0.27) * 0.3; }
    fit = fitFor(w / h, railName === "mobile" ? (built.portraitFit ?? 0.55) : (built.portraitFit ?? 1));
    const { fov, roll } = sampleRail(rail, p, pos, look, baseFov);
    const par = (built.parallax ?? 0.8) * (1 - S.dim * 0.6) * (reduced ? 0 : 1);
    pos.x += S.ptrX * par; pos.y -= S.ptrY * par * 0.55;
    look.x += S.ptrX * par * 1.4; look.y -= S.ptrY * par * 0.8;
    camera.position.copy(pos);
    camera.lookAt(look);

    // bank into lateral motion + roll + FOV kick on speed
    right.set(1, 0, 0).applyQuaternion(camera.quaternion);
    const lateral = first || dt === 0 ? 0 : (pos.clone().sub(prev).dot(right) / dt) * 0.0009;
    S.bank = damp(S.bank, clamp(lateral, -0.06, 0.06), 3, dt);
    camera.rotateZ(-S.bank * (reduced ? 0 : 1) + (roll * Math.PI) / 180);
    const kick = reduced ? 0 : Math.min(S.speed * 10, 5);
    // keep the subject's WIDTH when the viewport narrows: widen the vertical fov through tan(), never past 78°
    const vf = Math.min(78, (2 * Math.atan(Math.tan(((fov + kick) * Math.PI) / 360) * fit) * 180) / Math.PI);
    if (Math.abs(camera.fov - vf) > 0.001) {
      camera.fov = vf;
      camera.updateProjectionMatrix();
    }

    const fr: Frame = { time: t, dt, p: S.prog, velocity: S.speed, pointer: { x: S.ptrX, y: S.ptrY }, camera, quality, reduced };
    built.update(fr);

    // post uniforms (depth-aware effects follow the live camera + the scene's mutable `post` spec)
    if (depth && depth.enabled) {
      const rtw = depth.rt.width, rth = depth.rt.height;
      if (ao && ao.enabled) {
        const u = ao.uniforms;
        (u.uInvProj.value as THREE.Matrix4).copy(camera.projectionMatrixInverse);
        u.uProjY.value = camera.projectionMatrix.elements[5];
        u.uAspect.value = w / h; (u.uTexel.value as THREE.Vector2).set(1 / rtw, 1 / rth);
        u.uRadius.value = built.post?.ao?.radius ?? 0.9; u.uIntensity.value = built.post?.ao?.intensity ?? 0.9;
      }
      if (dof && dof.enabled) {
        const u = dof.uniforms, d = built.post?.dof;
        const fo = d?.focus ?? "auto";
        u.uNear.value = camera.near; u.uFar.value = camera.far; u.uAspect.value = w / h; u.uPx.value = 1.3 / h;
        u.uFocus.value = fo === "auto" ? camera.position.distanceTo(look) : fo;
        u.uAperture.value = d?.aperture ?? 1.6; u.uMaxBlur.value = (d?.maxBlur ?? 0.022) * (tier === "high" ? 1 : 0.75);
      }
    }

    U.uTime.value = t;
    U.uFade.value = S.fade;
    U.uDim.value = S.dim;
    U.uVel.value = reduced ? 0 : Math.min(S.speed * 4, 0.5);
    renderer.info.reset();
    composer.render(dt);
    listeners.forEach((cb) => cb(fr));
    first = false;
    if (dbg && now - dbgAt > 250) {
      dbgAt = now;
      dbg.textContent = `AURA ${tier.toUpperCase()}  ${fps}fps  q${quality.toFixed(1)}  dpr${dpr.toFixed(2)}\n${device.renderer.slice(0, 40)}\nbench ${device.gpuMsPerMP?.toFixed(2) ?? "—"} ms/MP (${device.source})\ncalls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles / 1e3) | 0}k\nao ${+live.ao} dof ${+live.dof} bloom ${+live.bloom}  p ${S.prog.toFixed(3)}`;
    }
  };
  frame();

  const seek = (p: number) => { S.locked = true; S.target = S.prog = clamp(p); S.speed = 0; dirty = Math.max(dirty, 3); };
  const release = () => { S.locked = false; };
  const info = (): AuraInfo => ({
    p: S.prog, locked: S.locked, fps, quality, size: [w, h], shots: rail, mobile, coarse, software, tier, device, budget: B, dpr, rail: railName, fit, mode,
    camera: { pos: camera.position.toArray() as V3, look: look.toArray() as V3, fov: camera.fov },
    drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
    motion: { reduced, frozen: reduced && elapsed === 0, ambientTime: elapsed },
    fx: { ...live },
  });
  const perf = () => {
    const s = [...times].sort((a, b) => a - b);
    const q = (f: number) => (s.length ? +s[Math.min(s.length - 1, Math.floor(s.length * f))].toFixed(2) : null);
    return { samples: s.length, p50: q(0.5), p95: q(0.95), p99: q(0.99), worst: q(1), fps, tier, quality, gpu: device.renderer, bench: device.gpuMsPerMP };
  };
  // agent / QA hook:  window.__aura.seek(0.37)  then screenshot.   ?p=0.37 in the URL does the same on load.
  const urlP = qs.get("p");
  if (urlP !== null && !Number.isNaN(parseFloat(urlP))) seek(parseFloat(urlP));
  const lost = (e: Event) => { e.preventDefault(); running = false; cancelAnimationFrame(raf); opts.onContextLost?.(); };
  const restored = () => opts.onContextRestored?.();
  renderer.domElement.addEventListener("webglcontextlost", lost);
  renderer.domElement.addEventListener("webglcontextrestored", restored);
  const hook = { seek, release, info, perf };
  (window as unknown as { __aura?: unknown }).__aura = hook;

  return {
    seek, release, info,
    setProgress: (p) => { S.target = clamp(p); dirty = Math.max(dirty, 2); },
    progress: () => S.prog,
    setDim: (d) => { S.dimT = clamp(d); dirty = Math.max(dirty, 2); },
    onFrame: (cb) => { listeners.add(cb); return () => void listeners.delete(cb); },
    quality: () => quality,
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      dbg?.remove();
      if ((window as unknown as { __aura?: unknown }).__aura === hook) delete (window as unknown as { __aura?: unknown }).__aura; // StrictMode double-mount safe
      ro.disconnect(); io.disconnect();
      built.dispose?.();
      built.scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => {
          for (const v of Object.values(x)) if (v instanceof THREE.Texture) v.dispose();
          x.dispose();
        });
      });
      depth?.dispose();
      env.dispose(); pmrem.dispose(); composer.dispose(); renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
