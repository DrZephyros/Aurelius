"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export type HorizontalScrollProps = {
  /** Each child becomes a panel in the horizontal track. */
  children: ReactNode;
  /** Gap between panels (px). */
  gap?: number;
  /** Show a progress bar at the bottom. */
  progress?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** Pins a section while vertical scrolling slides a horizontal track of panels. Give panels a width (e.g. 70vw). */
export function HorizontalScroll({ children, gap = 24, progress = true, className, style }: HorizontalScrollProps) {
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | undefined>();

  useEffect(() => {
    const o = outer.current!, t = track.current!;
    let dist = 0, raf = 0;
    const measure = () => { dist = Math.max(0, t.scrollWidth - innerWidth); setH(dist + innerHeight); paint(); };
    const paint = () => {
      const p = dist ? Math.min(1, Math.max(0, -o.getBoundingClientRect().top / dist)) : 0;
      t.style.transform = `translate3d(${-p * dist}px,0,0)`;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(t);
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", measure);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener("scroll", on); removeEventListener("resize", measure); };
  }, []);

  return (
    <div ref={outer} className={className} style={{ position: "relative", height: h ?? "300vh", ...style }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", display: "flex", alignItems: "center" }}>
        <div ref={track} style={{ display: "flex", gap, padding: "0 5vw", willChange: "transform" }}>{children}</div>
        {progress && (
          <div aria-hidden style={{ position: "absolute", left: "5vw", right: "5vw", bottom: 28, height: 2, background: "rgb(255 255 255/.12)" }}>
            <div ref={bar} style={{ height: "100%", background: "var(--au-accent,#5cffc4)", transformOrigin: "0 50%", transform: "scaleX(0)" }} />
          </div>
        )}
      </div>
    </div>
  );
}
