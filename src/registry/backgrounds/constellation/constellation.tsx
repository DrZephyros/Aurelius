"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export type ConstellationProps = {
  /** Particle count. Default scales with area. */
  count?: number;
  color?: string;
  /** Max distance (px) at which two particles are linked. */
  linkDistance?: number;
  /** Drift speed multiplier. */
  speed?: number;
  /** Particles connect to / are pulled toward the pointer. */
  interactive?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** Drifting particles joined by faint lines, reacting to the pointer. Fills its parent. */
export function Constellation({ count, color = "#8fe9ff", linkDistance = 120, speed = 1, interactive = true, children, className, style }: ConstellationProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current!, c = cv.current!, g = c.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, ps: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    const ptr = { x: -9999, y: -9999 };
    const build = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = el.clientWidth; h = el.clientHeight;
      c.width = w * dpr; c.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = count ?? Math.min(140, Math.max(24, Math.round((w * h) / 11000)));
      ps = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, r: 0.8 + Math.random() * 1.4 }));
    };
    build();
    const ro = new ResizeObserver(build); ro.observe(el);
    const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; };
    const leave = () => { ptr.x = ptr.y = -9999; };
    if (interactive) { el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave); }
    let raf = 0, visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting)); io.observe(el);
    const L2 = linkDistance * linkDistance;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      g.clearRect(0, 0, w, h);
      g.fillStyle = color; g.strokeStyle = color; g.lineWidth = 1;
      for (const p of ps) {
        if (!reduce) { p.x += p.vx * speed; p.y += p.vy * speed; }
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = ptr.x - p.x, dy = ptr.y - p.y, d2 = dx * dx + dy * dy;
        if (d2 < 22500 && d2 > 1) { p.x += dx * 0.006; p.y += dy * 0.006; }
        g.globalAlpha = 0.85; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.2832); g.fill();
      }
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x, dy = ps[i].y - ps[j].y, d2 = dx * dx + dy * dy;
          if (d2 < L2) { g.globalAlpha = (1 - d2 / L2) * 0.35; g.beginPath(); g.moveTo(ps[i].x, ps[i].y); g.lineTo(ps[j].x, ps[j].y); g.stroke(); }
        }
        const dx = ps[i].x - ptr.x, dy = ps[i].y - ptr.y, d2 = dx * dx + dy * dy;
        if (d2 < L2 * 1.6) { g.globalAlpha = (1 - d2 / (L2 * 1.6)) * 0.6; g.beginPath(); g.moveTo(ps[i].x, ps[i].y); g.lineTo(ptr.x, ptr.y); g.stroke(); }
      }
      g.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, [count, color, linkDistance, speed, interactive]);

  return (
    <div ref={wrap} className={className} style={{ position: "relative", overflow: "hidden", ...style }}>
      <canvas ref={cv} aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}
