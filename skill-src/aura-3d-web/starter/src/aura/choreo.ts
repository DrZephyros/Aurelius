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
  const nodes = [...root.querySelectorAll<HTMLElement>("[data-a]")].map((el) => {
    const a = parseFloat(el.dataset.a ?? "0"), b = parseFloat(el.dataset.b ?? "1");
    return {
      el, a, b,
      f: parseFloat(el.dataset.fade ?? "0.05"),
      // a chapter that starts at 0 is ALREADY on screen in frame one; one that ends at 1 STAYS for the final image.
      // (Scroll-fading the first/last chapter produces an empty opening frame and an empty closing frame.)
      first: a <= 0.001,
      last: b >= 0.999,
    };
  });
  return (p: number) => {
    for (const n of nodes) {
      const fin = n.first ? 1 : seg(p, n.a, n.a + n.f);
      const fout = n.last ? 0 : seg(p, n.b - n.f, n.b);
      const vis = Math.min(fin, 1 - fout);
      const s = n.el.style;
      s.setProperty("--in", fin.toFixed(4));
      s.setProperty("--out", fout.toFixed(4));
      s.setProperty("--vis", vis.toFixed(4));
      s.setProperty("--local", seg(p, n.a, n.b).toFixed(4));
      s.visibility = vis > 0.001 ? "visible" : "hidden";
    }
  };
}

/** FIT TYPE — make `[data-fit]` words exactly as wide as a fraction of the viewport (default 0.86), at any aspect ratio.
 *  Giant type must be sized by MEASUREMENT, not by guessing vw: font metrics differ and a cropped title reads as a bug.
 *  <div className="aura-giant" data-fit="0.86">OBSIDIAN</div>   (re-fits on resize and when web fonts finish loading) */
export function fitType(root: HTMLElement) {
  const run = () => {
    const vw = root.clientWidth || innerWidth;
    root.querySelectorAll<HTMLElement>("[data-fit]").forEach((el) => {
      const target = vw * parseFloat(el.dataset.fit || "0.86");
      el.style.fontSize = "100px";
      const r = document.createRange();
      r.selectNodeContents(el);
      const w = r.getBoundingClientRect().width;
      if (w > 0) el.style.fontSize = `${Math.min((100 * target) / w, (root.clientHeight || innerHeight) * 0.5)}px`;
    });
  };
  run();
  const ro = new ResizeObserver(run);
  ro.observe(root);
  document.fonts?.ready.then(run);
  return () => ro.disconnect();
}

/** Scroll progress (0..1) of a tall track element: 0 when its top hits the viewport top, 1 when its bottom hits the viewport bottom. */
export function trackProgress(track: HTMLElement) {
  // mobile browsers resize innerHeight as the URL bar collapses (≈ 56–90px). Measure against the LARGEST height seen,
  // so progress never jumps mid-scroll and always reaches exactly 1 at the end of the track.
  let maxH = 0;
  return () => {
    const r = track.getBoundingClientRect();
    maxH = Math.max(maxH, innerHeight);
    const range = r.height - maxH - 1;
    return range > 0 ? clamp(-r.top / range) : 0;
  };
}

/** Mechanical detent: pulls v toward the nearest stop when within `width`, so a scrubbed dial/knob "clicks" into place.
 *  Pass the scrubbed value (0..1) and the stops; use the result for rotation, not for the camera. */
export function snap(v: number, stops: number[], width = 0.035) {
  let best = stops[0];
  for (const s of stops) if (Math.abs(v - s) < Math.abs(v - best)) best = s;
  const d = v - best, a = Math.abs(d);
  if (a >= width) return v;
  const t = a / width;
  return best + Math.sign(d) * width * t * t * (3 - 2 * t);
}

/** Critically-underdamped spring step (for needles, dials, labels that should overshoot a little). Mutates and returns state. */
export function spring(s: { x: number; v: number }, target: number, dt: number, k = 60, c = 9) {
  s.v += ((target - s.x) * k - s.v * c) * dt;
  s.x += s.v * dt;
  return s.x;
}
