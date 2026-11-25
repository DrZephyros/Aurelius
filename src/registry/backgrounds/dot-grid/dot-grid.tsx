"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export type DotGridProps = {
  gap?: number;
  /** Dot radius in px. */
  size?: number;
  color?: string;
  /** Colour of dots near the pointer. */
  activeColor?: string;
  /** Pointer influence radius in px. */
  radius?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** A canvas dot grid: dots swell, glow and are pushed away near the cursor, then spring back. Fills its parent. */
export function DotGrid({ gap = 26, size = 1.5, color = "rgba(255,255,255,0.16)", activeColor = "#5cffc4", radius = 150, children, className, style }: DotGridProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current!, c = cv.current!, g = c.getContext("2d")!;
    let w = 0, h = 0, dpr = 1, dots: { x: number; y: number; ox: number; oy: number; vx: number; vy: number }[] = [];
    const ptr = { x: -9999, y: -9999 };
    const build = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = el.clientWidth; h = el.clientHeight;
      c.width = w * dpr; c.height = h * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (let y = gap / 2; y < h; y += gap) for (let x = gap / 2; x < w; x += gap) dots.push({ x, y, ox: 0, oy: 0, vx: 0, vy: 0 });
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    const move = (e: PointerEvent) => { const r = el.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; };
    const leave = () => { ptr.x = ptr.y = -9999; };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    let raf = 0, visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      g.clearRect(0, 0, w, h);
      g.fillStyle = color;
      const hot: [number, number, number][] = [];
      g.beginPath();
      for (const d of dots) {
        const dx = d.x - ptr.x, dy = d.y - ptr.y, dist = Math.hypot(dx, dy);
        const t = Math.max(0, 1 - dist / radius);
        // spring toward the pushed target, back to rest
        const push = t * t * 14;
        const tx = dist > 0.1 ? (dx / dist) * push : 0, ty = dist > 0.1 ? (dy / dist) * push : 0;
        d.vx += (tx - d.ox) * 0.12; d.vy += (ty - d.oy) * 0.12;
        d.vx *= 0.8; d.vy *= 0.8; d.ox += d.vx; d.oy += d.vy;
        if (t > 0.02) hot.push([d.x + d.ox, d.y + d.oy, t]);
        else { g.moveTo(d.x + d.ox + size, d.y + d.oy); g.arc(d.x + d.ox, d.y + d.oy, size, 0, 6.2832); }
      }
      g.fill();
      g.fillStyle = activeColor;
      for (const [x, y, t] of hot) { g.globalAlpha = 0.25 + t * 0.75; g.beginPath(); g.arc(x, y, size * (1 + t * 2.4), 0, 6.2832); g.fill(); }
      g.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, [gap, size, color, activeColor, radius]);

  return (
    <div ref={wrap} className={className} style={{ position: "relative", overflow: "hidden", ...style }}>
      <canvas ref={cv} aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}
