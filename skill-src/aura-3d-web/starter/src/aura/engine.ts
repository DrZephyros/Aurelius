import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { clamp, damp, ease } from "./choreo";

/* ─────────────────────────────────────────────────────────────
   AURA · engine.ts — the cinematic runtime.

   · The camera rides a keyframed SHOT LIST (position + look-at + fov + roll), Catmull-Rom smoothed.
     Each shot has an `at` ∈ [0,1] so you control PACING: put two shots close together to rush,
     repeat a position across two `at` values to HOLD.
   · Scroll progress is the playhead. It is critically damped → the camera glides, overshoots, settles.
   · Velocity kicks the FOV, adds chromatic fringing and banks the horizon (a real dolly cam).
   · Pointer adds parallax. Reduced-motion users get an instant, calm playhead.
   · A post stack (bloom → tonemap → grade/grain/vignette/aberration) gives the filmic finish.
   · An adaptive quality governor protects 60fps on weak GPUs by lowering the pixel ratio.
   A scene is just a function that returns an AuraScene. See scene.example.ts.
   ───────────────────────────────────────────────────────────── */

export type V3 = [number, number, number];

export type Shot = {
  /** playhead position 0..1 at which the camera reaches this shot */
  at: number;
  pos: V3;
  look: V3;
  /** vertical FOV in degrees (lens). 24–32 = telephoto drama · 45 = natural · 60+ = wide / speed */
  fov?: number;
  /** degrees of Dutch tilt */
  roll?: number;
  /** easing applied to the move INTO the next shot. default linear (continuous glide) */
  ease?: "linear" | "inOut" | "out";
};

export type Grade = {
  vignette?: number;
  grain?: number;
  aberration?: number;
  contrast?: number;
  saturation?: number;
  /** colour pushed into the shadows / highlights (split-toning). 0..1 per channel, keep it subtle */
  shadows?: V3;
  highlights?: V3;
};

export interface Frame {
  /** seconds since mount */
  time: number;
  dt: number;
  /** the damped playhead 0..1 — drive EVERYTHING from this */
  p: number;
  /** playhead speed (≈ scroll velocity, always ≥ 0) */
  velocity: number;
  /** pointer in -1..1 (smoothed) */
  pointer: { x: number; y: number };
  camera: THREE.PerspectiveCamera;
  /** 0..1 — current adaptive quality; gate expensive effects on it */
  quality: number;
  reduced: boolean;
}

export interface AuraScene {
  scene: THREE.Scene;
  shots: Shot[];
  fov?: number;
  exposure?: number;
  bloom?: { strength: number; radius: number; threshold: number };
  grade?: Grade;
  /** pointer parallax in world units (default 0.8) */
  parallax?: number;
  update(f: Frame): void;
  dispose?(): void;
}

export interface BuildContext {
  renderer: THREE.WebGLRenderer;
  /** pre-filtered neutral studio environment (PMREM). Assign to scene.environment for instant PBR realism */
  env: THREE.Texture;
  mobile: boolean;
  reduced: boolean;
  quality: number;
}

export type Builder = (ctx: BuildContext) => AuraScene | Promise<AuraScene>;

export interface AuraOptions {
  /** ceiling for devicePixelRatio. 1.75 desktop · 1.25 mobile are sane defaults */
  maxDpr?: number;
  /** called every frame BEFORE damping to read the raw target progress (e.g. trackProgress(el)) */
  progress?: () => number;
}

export interface AuraInfo {
  p: number;
  locked: boolean;
  fps: number;
  quality: number;
  size: [number, number];
  shots: Shot[];
  /** the camera's current world position / look target / fov — handy when an agent is tuning shots from screenshots */
  camera: { pos: V3; look: V3; fov: number };
  drawCalls: number;
  triangles: number;
}

export interface AuraHandle {
  /** DETERMINISTIC SEEK — lock the playhead to p and settle instantly (no damping, no pointer drift, no velocity effects).
   *  Identical input → identical frame. This is how agents screenshot a scroll position exactly. Also available as window.__aura.seek(p). */
  seek(p: number): void;
  /** hand control back to the scroll position */
  release(): void;
  info(): AuraInfo;
  setProgress(p: number): void;
  progress(): number;
  /** dim the world (0..1), e.g. while a modal is open */
  setDim(d: number): void;
  /** subscribe to every rendered frame (after the scene update). Returns unsubscribe */
  onFrame(cb: (f: Frame) => void): () => void;
  quality(): number;
  dispose(): void;
}

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
  const mobile = w < 760 || matchMedia("(pointer: coarse)").matches;
  const maxDpr = Math.min(devicePixelRatio || 1, opts.maxDpr ?? (mobile ? 1.25 : 1.75));

  const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance", stencil: false });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.info.autoReset = false; // composer renders several passes per frame — we reset once per frame so info() reports the whole frame
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%";
  host.appendChild(renderer.domElement);

  let quality = mobile ? 0.75 : 1;
  const dprFor = (q: number) => maxDpr * (0.6 + 0.4 * q);
  let dpr = dprFor(quality);
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const built = await build({ renderer, env, mobile, reduced, quality });
  renderer.toneMappingExposure = built.exposure ?? 1;
  const baseFov = built.fov ?? 40;
  const camera = new THREE.PerspectiveCamera(baseFov, w / h, 0.1, 2000);

  const composer = new EffectComposer(renderer);
  composer.setPixelRatio(dpr);
  composer.setSize(w, h);
  composer.addPass(new RenderPass(built.scene, camera));
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
  const onMove = (e: PointerEvent) => { S.tx = (e.clientX / innerWidth) * 2 - 1; S.ty = (e.clientY / innerHeight) * 2 - 1; };
  addEventListener("pointermove", onMove, { passive: true });

  const applyQuality = () => {
    dpr = dprFor(quality);
    renderer.setPixelRatio(dpr);
    composer.setPixelRatio(dpr);
    renderer.setSize(w, h);
    composer.setSize(w, h);
    bloom.enabled = quality > 0.45;
  };
  const resize = () => {
    w = host.clientWidth || innerWidth; h = host.clientHeight || innerHeight;
    renderer.setSize(w, h); composer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
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
  const lastShot = built.shots[built.shots.length - 1].at;
  if (built.shots[0].at !== 0 || lastShot !== 1) console.warn(`[aura] shots should start at 0 and end at 1 (got ${built.shots[0].at} → ${lastShot}). The camera freezes outside the rail.`);

  const frame = () => {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const now = performance.now();
    const raw = (now - last) / 1000;
    last = now;
    if (document.hidden || !visible) return;
    const dt = Math.min(raw, 0.05);
    elapsed += dt;
    const t = elapsed;

    // ── adaptive quality governor: after warm-up, if the average frame is slow, step the pixel ratio down (never back up → no flapping)
    if (++frames > 90) {
      acc += raw;
      if ((frames - 90) % 45 === 0) {
        if (acc / 45 > 1 / 38 && quality > 0.2) { quality = Math.max(0.2, quality - 0.2); applyQuality(); }
        acc = 0;
      }
    }

    ema += (raw - ema) * 0.05; fps = Math.round(1 / Math.max(ema, 1e-3));
    if (!S.locked && opts.progress) S.target = clamp(opts.progress());
    const before = S.prog;
    S.prog = first || S.locked ? S.target : damp(S.prog, S.target, reduced ? 20 : 3.2, dt);
    if (S.locked) { S.fade = 1; S.tx = S.ty = S.ptrX = S.ptrY = 0; }
    S.dim = damp(S.dim, S.dimT, 2.4, dt);
    S.fade = Math.min(1, S.fade + dt * 0.8);
    S.ptrX = damp(S.ptrX, S.tx, 2.4, dt);
    S.ptrY = damp(S.ptrY, S.ty, 2.4, dt);
    const vel = dt > 0 && !S.locked ? Math.abs(S.prog - before) / dt : 0;
    S.speed = damp(S.speed, vel, 4, dt);

    const p = clamp(S.prog, 0, 0.9999);
    prev.copy(pos);
    const aspectFov = w / h < 0.8 ? 18 : 0; // portrait phones need a wider lens
    const { fov, roll } = sampleRail(built.shots, p, pos, look, baseFov);
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
    if (Math.abs(camera.fov - (fov + aspectFov + kick)) > 0.001) {
      camera.fov = fov + aspectFov + kick;
      camera.updateProjectionMatrix();
    }

    const fr: Frame = { time: t, dt, p: S.prog, velocity: S.speed, pointer: { x: S.ptrX, y: S.ptrY }, camera, quality, reduced };
    built.update(fr);

    U.uTime.value = t;
    U.uFade.value = S.fade;
    U.uDim.value = S.dim;
    U.uVel.value = reduced ? 0 : Math.min(S.speed * 4, 0.5);
    renderer.info.reset();
    composer.render(dt);
    listeners.forEach((cb) => cb(fr));
    first = false;
  };
  frame();

  const seek = (p: number) => { S.locked = true; S.target = S.prog = clamp(p); S.speed = 0; };
  const release = () => { S.locked = false; };
  const info = (): AuraInfo => ({
    p: S.prog, locked: S.locked, fps, quality, size: [w, h], shots: built.shots,
    camera: { pos: camera.position.toArray() as V3, look: look.toArray() as V3, fov: camera.fov },
    drawCalls: renderer.info.render.calls, triangles: renderer.info.render.triangles,
  });
  // agent / QA hook:  window.__aura.seek(0.37)  then screenshot.   ?p=0.37 in the URL does the same on load.
  const urlP = new URLSearchParams(location.search).get("p");
  if (urlP !== null && !Number.isNaN(parseFloat(urlP))) seek(parseFloat(urlP));
  const hook = { seek, release, info };
  (window as unknown as { __aura?: unknown }).__aura = hook;

  return {
    seek, release, info,
    setProgress: (p) => { S.target = clamp(p); },
    progress: () => S.prog,
    setDim: (d) => { S.dimT = clamp(d); },
    onFrame: (cb) => { listeners.add(cb); return () => void listeners.delete(cb); },
    quality: () => quality,
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
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
      env.dispose(); pmrem.dispose(); composer.dispose(); renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
