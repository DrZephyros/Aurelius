"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export type TimelineItem = { title: string; date?: string; description?: ReactNode };
export type TimelineProps = { items: TimelineItem[]; className?: string; style?: CSSProperties };

const CSS = `.au-tl{position:relative;padding-left:44px}
.au-tl-rail{position:absolute;left:11px;top:8px;bottom:8px;width:2px;background:rgb(255 255 255/.12);border-radius:2px}
.au-tl-fill{position:absolute;left:0;top:0;width:100%;height:100%;background:linear-gradient(var(--au-accent,#5cffc4),var(--au-accent-2,#a58bff));border-radius:2px;transform-origin:50% 0;transform:scaleY(0)}
.au-tl-i{position:relative;padding-bottom:44px;opacity:.35;transform:translateX(8px);transition:opacity .6s,transform .6s cubic-bezier(.16,1,.3,1)}.au-tl-i:last-child{padding-bottom:0}
.au-tl-i.au-on{opacity:1;transform:none}
.au-tl-d{position:absolute;left:-44px;top:4px;width:24px;height:24px;border-radius:50%;background:var(--au-bg,#04060c);border:2px solid rgb(255 255 255/.2);display:grid;place-items:center;transition:border-color .4s,box-shadow .4s}
.au-tl-d::after{content:"";width:8px;height:8px;border-radius:50%;background:rgb(255 255 255/.25);transition:background .4s,transform .4s}
.au-on .au-tl-d{border-color:var(--au-accent,#5cffc4);box-shadow:0 0 22px color-mix(in srgb,var(--au-accent,#5cffc4) 60%,transparent)}.au-on .au-tl-d::after{background:var(--au-accent,#5cffc4);transform:scale(1.2)}
@media (prefers-reduced-motion:reduce){.au-tl-i{transition:none;opacity:1;transform:none}}`;

/** A vertical timeline whose rail fills and whose steps light up as you scroll past them. */
export function Timeline({ items, className, style }: TimelineProps) {
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current!;
    const steps = [...el.querySelectorAll<HTMLElement>(".au-tl-i")];
    let raf = 0;
    const paint = () => {
      const r = el.getBoundingClientRect(), mid = innerHeight * 0.55;
      const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      if (fill.current) fill.current.style.transform = `scaleY(${p})`;
      steps.forEach((s) => s.classList.toggle("au-on", s.getBoundingClientRect().top < mid));
    };
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); };
    paint();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", on); removeEventListener("resize", on); };
  }, [items.length]);
  return (
    <div ref={root} className={`au-tl ${className ?? ""}`} style={style}>
      <style>{CSS}</style>
      <div className="au-tl-rail" aria-hidden><div ref={fill} className="au-tl-fill" /></div>
      {items.map((it, i) => (
        <div key={i} className="au-tl-i">
          <span className="au-tl-d" aria-hidden />
          {it.date && <div style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.55 }}>{it.date}</div>}
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginTop: 4 }}>{it.title}</div>
          {it.description && <div style={{ marginTop: 6, opacity: 0.65, lineHeight: 1.6, maxWidth: "56ch" }}>{it.description}</div>}
        </div>
      ))}
    </div>
  );
}
