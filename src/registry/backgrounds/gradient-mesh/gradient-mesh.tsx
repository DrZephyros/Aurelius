"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export type GradientMeshProps = {
  colors?: string[];
  /** How strongly the blobs follow the pointer (0–1). */
  follow?: number;
  background?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-gm{position:relative;overflow:hidden;isolation:isolate}
.au-gm-b{position:absolute;inset:0;z-index:-1;pointer-events:none;filter:blur(70px) saturate(1.3)}
.au-gm-b i{position:absolute;width:55%;aspect-ratio:1;border-radius:50%;will-change:transform;opacity:.75}
.au-gm-n{position:absolute;inset:0;z-index:-1;pointer-events:none;opacity:.07;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")}`;

/** Soft colour blobs that glide toward your cursor — a living mesh gradient with film grain. */
export function GradientMesh({ colors = ["#3de7ff", "#a58bff", "#ff7ad9", "#5cffc4"], follow = 0.6, background = "#06080f", children, className, style }: GradientMeshProps) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current!;
    const blobs = [...el.querySelectorAll<HTMLElement>(".au-gm-b i")];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const p = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const onMove = (e: PointerEvent) => { const r = el.getBoundingClientRect(); p.tx = (e.clientX - r.left) / r.width; p.ty = (e.clientY - r.top) / r.height; };
    el.addEventListener("pointermove", onMove);
    let raf = 0, visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      p.x += (p.tx - p.x) * 0.04; p.y += (p.ty - p.y) * 0.04;
      blobs.forEach((b, i) => {
        const a = reduce ? 0 : t / 1000 / (6 + i * 2) + i * 1.7;
        const bx = [8, 50, 20, 55][i % 4] + Math.cos(a) * 8, by = [10, 0, 45, 40][i % 4] + Math.sin(a * 1.3) * 8;
        const k = (i % 2 ? -1 : 1) * follow * 22;
        b.style.transform = `translate(${bx + (p.x - 0.5) * k}%, ${by + (p.y - 0.5) * k}%)`;
      });
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); io.disconnect(); el.removeEventListener("pointermove", onMove); };
  }, [follow]);

  return (
    <div ref={root} className={`au-gm ${className ?? ""}`} style={{ background, ...style }}>
      <style>{CSS}</style>
      <div className="au-gm-b" aria-hidden>{colors.slice(0, 4).map((c, i) => <i key={i} style={{ background: c }} />)}</div>
      <div className="au-gm-n" aria-hidden />
      {children}
    </div>
  );
}
