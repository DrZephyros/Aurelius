import * as THREE from "three";
import { clamp, damp } from "./choreo";
import { BUDGETS } from "./device";
import type { AuraScene, BuildContext, Builder, Frame, Shot, V3 } from "./contract";

/* ─────────────────────────────────────────────────────────────
   AURA · portable.ts — run an AuraScene ANYWHERE.

   1. createMinimalHost(canvasHost, build)   a complete reference host in ~80 lines: no post stack, but it honours EVERYTHING in the contract
      (per-shot `at` timing, shotsMobile, reduced motion → frozen ambient time, budget, quality, pointer, seek). Copy it into R3F, Next,
      the Builder bundle host, a Shopify theme — whichever needs to run the scenes you build here.
   2. adaptLegacy(old)                       wrap a pre-v18 `{ scene, rail:{pos[],look[]}, update(t,p,dt,cam) }` bundle scene as an AuraScene:
      the rail becomes evenly-timed shots (override with `at`), so nothing is lost and nothing needs a shim that hard-codes pointer/quality.
   3. railSampler(shots)                     the engine's Catmull-Rom sampler, exported, for hosts that drive their own camera.
   ───────────────────────────────────────────────────────────── */

const cr = (a: number, b: number, c: number, d: number, t: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
const EASE = { linear: (t: number) => t, inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), out: (t: number) => 1 - Math.pow(1 - t, 3) };

export function railSampler(shots: Shot[], baseFov = 40) {
  return (p: number, pos: THREE.Vector3, look: THREE.Vector3) => {
    const n = shots.length; let i = 0;
    while (i < n - 2 && p >= shots[i + 1].at) i++;
    const s1 = shots[i], s2 = shots[Math.min(i + 1, n - 1)], s0 = shots[Math.max(i - 1, 0)], s3 = shots[Math.min(i + 2, n - 1)];
    const t = EASE[s1.ease ?? "linear"](clamp((p - s1.at) / Math.max(1e-5, s2.at - s1.at)));
    pos.set(cr(s0.pos[0], s1.pos[0], s2.pos[0], s3.pos[0], t), cr(s0.pos[1], s1.pos[1], s2.pos[1], s3.pos[1], t), cr(s0.pos[2], s1.pos[2], s2.pos[2], s3.pos[2], t));
    look.set(cr(s0.look[0], s1.look[0], s2.look[0], s3.look[0], t), cr(s0.look[1], s1.look[1], s2.look[1], s3.look[1], t), cr(s0.look[2], s1.look[2], s2.look[2], s3.look[2], t));
    const f1 = s1.fov ?? baseFov, f2 = s2.fov ?? baseFov;
    return { fov: f1 + (f2 - f1) * t, roll: ((s1.roll ?? 0) + ((s2.roll ?? 0) - (s1.roll ?? 0)) * t) };
  };
}

/** The old bundle-host shape (src/bundles/engine.ts before v18). */
export interface LegacyBuilt {
  scene: THREE.Scene;
  rail: { pos: number[][]; look: number[][] };
  bloom?: [number, number, number];
  exposure?: number;
  fov?: number;
  parallax?: number;
  update(t: number, p: number, dt: number, cam: THREE.PerspectiveCamera): void;
  dispose?(): void;
}

export function adaptLegacy(old: LegacyBuilt, o: { at?: number[]; fovs?: number[] } = {}): AuraScene {
  const n = old.rail.pos.length;
  const shots: Shot[] = old.rail.pos.map((pos, i) => ({ at: o.at?.[i] ?? i / (n - 1), pos: pos as V3, look: (old.rail.look[Math.min(i, old.rail.look.length - 1)] ?? [0, 0, 0]) as V3, fov: o.fovs?.[i] }));
  return {
    scene: old.scene, shots, fov: old.fov, exposure: old.exposure, parallax: old.parallax,
    bloom: old.bloom ? { strength: old.bloom[0], radius: old.bloom[1], threshold: old.bloom[2] } : undefined,
    update: (f: Frame) => old.update(f.time, f.p, f.dt, f.camera),
    dispose: old.dispose,
  };
}

/** Reference host. Returns a handle with the same seek()/dispose() shape as mountAura. */
export async function createMinimalHost(host: HTMLElement, build: Builder, o: { progress?: () => number; tier?: "low" | "mid" | "high" } = {}) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches, coarse = matchMedia("(pointer: coarse)").matches;
  let w = host.clientWidth || innerWidth, h = host.clientHeight || innerHeight;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.domElement.style.cssText = "display:block;width:100%;height:100%"; host.appendChild(renderer.domElement);
  const tier = o.tier ?? (coarse ? "mid" : "high"), budget = BUDGETS[tier](coarse);
  renderer.setPixelRatio(Math.min(devicePixelRatio, budget.dpr)); renderer.setSize(w, h);
  const pm = new THREE.PMREMGenerator(renderer), env = pm.fromScene(new THREE.Scene(), 0.04).texture;
  const device = { tier, gpuMsPerMP: null, source: "heuristic" as const, renderer: "minimal-host", software: false, cores: navigator.hardwareConcurrency ?? 4, memoryGB: null, reasons: ["minimal host: tier is declared, not measured"] };
  const ctx: BuildContext = { renderer, env, mobile: w < 760 || coarse, portrait: w / h < 0.85, coarse, tier, budget, device, reduced, quality: 1 };
  const sc = await build(ctx);
  renderer.toneMappingExposure = sc.exposure ?? 1;
  const cam = new THREE.PerspectiveCamera(sc.fov ?? 40, w / h, 0.1, 2000);
  const pos = new THREE.Vector3(), look = new THREE.Vector3();
  const S = { p: 0, target: 0, locked: false, tx: 0, ty: 0, x: 0, y: 0 };
  const onMove = (e: PointerEvent) => { if (e.pointerType !== "touch" && !reduced) { S.tx = (e.clientX / innerWidth) * 2 - 1; S.ty = (e.clientY / innerHeight) * 2 - 1; } };
  addEventListener("pointermove", onMove, { passive: true });
  const ro = new ResizeObserver(() => { w = host.clientWidth; h = host.clientHeight; renderer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); }); ro.observe(host);
  let last = performance.now(), t = 0, raf = 0, run = true;
  const loop = () => {
    if (!run) return; raf = requestAnimationFrame(loop);
    const now = performance.now(), dt = Math.min(0.05, (now - last) / 1000); last = now; if (!reduced) t += dt; // ← reduced motion: ambient time never advances
    if (!S.locked && o.progress) S.target = clamp(o.progress());
    S.p = S.locked ? S.target : damp(S.p, S.target, reduced ? 20 : 3.2, dt);
    S.x = damp(S.x, S.tx, 2.4, dt); S.y = damp(S.y, S.ty, 2.4, dt);
    const portrait = w / h < 0.85, rail = portrait && sc.shotsMobile ? sc.shotsMobile : sc.shots; // ← the portrait rail is honoured
    const { fov, roll } = railSampler(rail, sc.fov ?? 40)(clamp(S.p, 0, 0.9999), pos, look); // ← per-shot `at` timing is honoured
    const par = (sc.parallax ?? 0.8) * (reduced ? 0 : 1);
    cam.position.set(pos.x + S.x * par, pos.y - S.y * par * 0.55, pos.z); cam.lookAt(look.x + S.x * par * 1.4, look.y - S.y * par * 0.8, look.z);
    cam.rotateZ((roll * Math.PI) / 180); cam.fov = fov; cam.updateProjectionMatrix();
    sc.update({ time: t, dt, p: S.p, velocity: 0, pointer: { x: S.x, y: S.y }, camera: cam, quality: 1, reduced });
    renderer.render(sc.scene, cam);
  };
  loop();
  return {
    seek(p: number) { S.locked = true; S.target = S.p = clamp(p); }, release() { S.locked = false; },
    setProgress(p: number) { S.target = clamp(p); },
    dispose() { run = false; cancelAnimationFrame(raf); removeEventListener("pointermove", onMove); ro.disconnect(); sc.dispose?.(); renderer.dispose(); renderer.domElement.remove(); },
  };
}
