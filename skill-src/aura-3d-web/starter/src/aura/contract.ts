import type * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   AURA · contract.ts — THE PORTABLE SCENE CONTRACT.  Types only. No runtime, no engine import.

   Any host can run an AURA scene if it can supply a `BuildContext` and call `AuraScene.update(frame)` once per frame:
     · the reference host is `mountAura` (engine.ts): post stack, governor, seek hook, reduced-motion, fallbacks
     · `createMinimalHost` (portable.ts): ~80 lines, no post stack — the template for R3F / Next / the Builder bundle host
     · `adaptLegacy` (portable.ts): wraps an older `{ scene, rail:{pos,look}, update(t,p,dt,cam) }` scene so it keeps working
   A host MUST honour: shots[].at timing, shotsMobile on portrait, ctx.reduced (no ambient motion), ctx.budget (counts), f.quality.
   ───────────────────────────────────────────────────────────── */

export type V3 = [number, number, number];

export type Shot = {
  /** playhead position 0..1 at which the camera reaches this shot */
  at: number;
  pos: V3;
  look: V3;
  /** vertical FOV in degrees. 24–32 = telephoto drama · 45 = natural · 60+ = wide / speed */
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
  /** seconds of AMBIENT time. Frozen (== 0) when `reduced` — drive idle motion from this and it stops by itself. */
  time: number;
  dt: number;
  /** the damped playhead 0..1 — drive EVERYTHING story-related from this */
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

/** Post effects the HOST runs for you. Everything is optional; the host drops them in this order when frames get slow: ao → dof → bloom. */
export interface PostSpec {
  /** screen-space ambient occlusion (Alchemy/GTAO-class) from a half-res depth pre-pass. radius in world units. */
  ao?: { radius?: number; intensity?: number };
  /** physically-motivated bokeh depth of field. `focus` = world distance to the sharp plane ("auto" = camera → look target). `aperture` ≈ 0.5–4. */
  dof?: { focus?: number | "auto"; aperture?: number; maxBlur?: number };
}

export interface AuraScene {
  scene: THREE.Scene;
  shots: Shot[];
  fov?: number;
  exposure?: number;
  bloom?: { strength: number; radius: number; threshold: number };
  grade?: Grade;
  /** MUTABLE: change `.dof.focus` / `.ao.intensity` from update() to rack focus between chapters. */
  post?: PostSpec;
  /** A hand-authored rail for portrait phones (aspect < 0.85). Same story, re-framed: subject high, copy low. */
  shotsMobile?: Shot[];
  /** fraction of viewport height the picture is lifted by in portrait so the subject sits ABOVE the copy zone. default 0.11, 0 disables */
  portraitLift?: number;
  /** 0..1.5 — how strongly the lens widens in portrait (default 1). 0 if your rail is already hand-tuned. */
  portraitFit?: number;
  /** pointer parallax in world units (default 0.8) */
  parallax?: number;
  /** `light` flips the audit's brightness expectations (a light-mode world is not "too bright"). default dark. */
  mode?: "dark" | "light";
  update(f: Frame): void;
  dispose?(): void;
}

/** What a device can afford. MEASURED once at start-up (device.ts), then steered live by the governor. Scale counts by these — never by `mobile`. */
export interface Budget {
  /** pixel-ratio ceiling */
  dpr: number;
  /** MSAA samples for the scene pass (0 / 2 / 4) */
  msaa: number;
  /** multiply every particle / instance count by this (0.25..1) */
  particles: number;
  /** max Gaussian splats */
  splats: number;
  /** ray-march steps for SDF heroes */
  sdfSteps: number;
  /** effects the device can afford at all (the governor can still switch them off live) */
  fx: { ao: boolean; dof: boolean; bloom: boolean; probe: boolean; audio: boolean };
}

export interface DeviceReport {
  tier: "low" | "mid" | "high";
  /** GPU cost of the calibration shader in ms per megapixel (null = not measurable, e.g. timer-less / blocked) */
  gpuMsPerMP: number | null;
  /** how the tier was decided — "benchmark" | "heuristic" | "software" */
  source: "benchmark" | "heuristic" | "software";
  renderer: string;
  software: boolean;
  cores: number;
  memoryGB: number | null;
  reasons: string[];
}

export interface BuildContext {
  renderer: THREE.WebGLRenderer;
  /** pre-filtered neutral studio environment (PMREM). Fine for props — a HERO deserves createStudioEnv */
  env: THREE.Texture;
  /** LAYOUT hint: narrow viewport or coarse pointer. Use for layout, NOT for budgets. */
  mobile: boolean;
  /** viewport is portrait-ish (aspect < 0.85) at build time. The host re-selects the rail live on rotate/resize. */
  portrait: boolean;
  /** coarse pointer (finger). No hover, no cursor parallax. */
  coarse: boolean;
  /** MEASURED device class (see `device`). Gate transmission, mirror floors, SDF steps, particle bands on it. */
  tier: "low" | "mid" | "high";
  /** the numbers to build to */
  budget: Budget;
  device: DeviceReport;
  reduced: boolean;
  quality: number;
}

export type Builder = (ctx: BuildContext) => AuraScene | Promise<AuraScene>;

export interface AuraOptions {
  /** ceiling for devicePixelRatio. Defaults to the measured budget */
  maxDpr?: number;
  /** called every frame BEFORE damping to read the raw target progress (e.g. trackProgress(el)) */
  progress?: () => number;
  /** the WebGL context was lost (iOS Safari under memory pressure). Show the static edition; the shell re-mounts when restored. */
  onContextLost?: () => void;
  onContextRestored?: () => void;
  /** force a tier (testing, or a user "performance" switch). Skips the benchmark. */
  forceTier?: "low" | "mid" | "high";
}

export interface AuraInfo {
  p: number;
  locked: boolean;
  fps: number;
  quality: number;
  size: [number, number];
  shots: Shot[];
  camera: { pos: V3; look: V3; fov: number };
  drawCalls: number;
  triangles: number;
  mobile: boolean;
  coarse: boolean;
  software: boolean;
  tier: "low" | "mid" | "high";
  device: DeviceReport;
  budget: Budget;
  dpr: number;
  rail: "desktop" | "mobile";
  fit: number;
  /** reduced-motion state: `reduced` = user preference, `frozen` = the host really stopped ambient time (what the audit verifies) */
  motion: { reduced: boolean; frozen: boolean; ambientTime: number };
  /** which post effects are live this frame */
  fx: { ao: boolean; dof: boolean; bloom: boolean };
  mode: "dark" | "light";
}

export interface AuraHandle {
  /** DETERMINISTIC SEEK — lock the playhead to p and settle instantly (no damping, no pointer drift, no velocity effects).
   *  Identical input → identical frame. Also available as window.__aura.seek(p). */
  seek(p: number): void;
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
