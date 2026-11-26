"use client";

export type ConfettiOptions = {
  /** Origin in viewport px. Defaults to the screen centre-bottom. */
  x?: number;
  y?: number;
  count?: number;
  colors?: string[];
  /** Spread angle in degrees (centred upward). */
  spread?: number;
  /** Initial speed. */
  power?: number;
};

/** Fire a one-off confetti burst on a temporary full-screen canvas. Call from any click handler: `fireConfetti({ x: e.clientX, y: e.clientY })`. */
export function fireConfetti({ x, y, count = 140, colors = ["#5cffc4", "#3de7ff", "#a58bff", "#ff7ad9", "#ffd28a"], spread = 70, power = 16 }: ConfettiOptions = {}): void {
  if (typeof document === "undefined" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv = document.createElement("canvas");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const W = innerWidth, H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:99999";
  cv.setAttribute("aria-hidden", "true");
  document.body.appendChild(cv);
  const g = cv.getContext("2d")!;
  g.scale(dpr, dpr);
  const ox = x ?? W / 2, oy = y ?? H * 0.75;
  const ps = Array.from({ length: count }, () => {
    const a = (-90 + (Math.random() - 0.5) * spread * 2) * (Math.PI / 180), s = power * (0.45 + Math.random() * 0.75);
    return { x: ox, y: oy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, w: 6 + Math.random() * 7, h: 3 + Math.random() * 5, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4, c: colors[(Math.random() * colors.length) | 0], life: 0 };
  });
  let raf = 0;
  const frame = () => {
    g.clearRect(0, 0, W, H);
    let alive = 0;
    for (const p of ps) {
      p.vy += 0.42; p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
      if (p.y < H + 20) alive++;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = Math.max(0, 1 - p.life / 180);
      g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2) * 0.7 + 0.3)); g.restore();
    }
    if (alive && ps[0].life < 200) raf = requestAnimationFrame(frame); else { cancelAnimationFrame(raf); cv.remove(); }
  };
  raf = requestAnimationFrame(frame);
}
