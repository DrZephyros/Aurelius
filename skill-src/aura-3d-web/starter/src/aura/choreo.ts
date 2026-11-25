/* ─────────────────────────────────────────────────────────────
   AURA · choreo.ts
   Pure helpers for turning one number (the scroll playhead, 0..1)
   into everything on screen. No dependencies.

   RULE: there is ONE playhead. The camera, the DOM copy, the
   particles and the grade all read the same damped value.
   ───────────────────────────────────────────────────────────── */

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Frame-rate independent damping. `lambda` ≈ responsiveness (3 = floaty dolly, 8 = snappy). */
export const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));

export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Normalised progress of `p` through the window [a, b], clamped to 0..1. The workhorse. */
export const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));

/** 0 → 1 → 0 window: ramps up over `fin`, holds, ramps down over `fout`. Perfect for chapter visibility. */
export const pulse = (p: number, a: number, b: number, fin = 0.04, fout = 0.04) =>
  Math.min(seg(p, a, a + fin), 1 - seg(p, b - fout, b));

export const ease = {
  linear: (t: number) => t,
  inCubic: (t: number) => t * t * t,
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  inOutQuint: (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2),
  outExpo: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  outBack: (t: number) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
};

/* ── DOM choreography ──────────────────────────────────────────
   Mark any element with  data-a (start) and data-b (end) in 0..1 scroll progress.
   Every frame we write CSS variables on it:
     --in     0→1 over the first `data-fade` of the window  (entrance)
     --out    0→1 over the last  `data-fade`                (exit)
     --vis    0→1→0 combined opacity window
     --local  0→1 across the whole window                   (use for scrubbed text, counters, bars)
   and toggle visibility:hidden outside the window (cheap, and keeps focus order sane).
   Style them in aura.css with calc() — no JS per element, no layout thrash. */
export function bindDom(root: HTMLElement) {
  const nodes = [...root.querySelectorAll<HTMLElement>("[data-a]")].map((el) => ({
    el,
    a: parseFloat(el.dataset.a ?? "0"),
    b: parseFloat(el.dataset.b ?? "1"),
    f: parseFloat(el.dataset.fade ?? "0.05"),
  }));
  return (p: number) => {
    for (const n of nodes) {
      const vis = pulse(p, n.a, n.b, n.f, n.f);
      const s = n.el.style;
      s.setProperty("--in", seg(p, n.a, n.a + n.f).toFixed(4));
      s.setProperty("--out", seg(p, n.b - n.f, n.b).toFixed(4));
      s.setProperty("--vis", vis.toFixed(4));
      s.setProperty("--local", seg(p, n.a, n.b).toFixed(4));
      s.visibility = vis > 0.001 ? "visible" : "hidden";
    }
  };
}

/** Scroll progress (0..1) of a tall track element: 0 when its top hits the viewport top, 1 when its bottom hits the viewport bottom. */
export function trackProgress(track: HTMLElement) {
  return () => {
    const r = track.getBoundingClientRect();
    const range = r.height - innerHeight;
    return range > 0 ? clamp(-r.top / range) : 0;
  };
}
