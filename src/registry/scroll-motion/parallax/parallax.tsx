"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

export type ParallaxProps = {
  children: ReactNode;
  /** −1…1. Positive moves slower than the page (feels deeper), negative faster. */
  speed?: number;
  axis?: "y" | "x";
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

/** Moves its children at a different speed than the scroll. Stack layers with different `speed` for depth. */
export function Parallax({ children, speed = 0.25, axis = "y", as, className, style }: ParallaxProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, visible = false;
    const paint = () => {
      const r = el.getBoundingClientRect();
      const off = (r.top + r.height / 2 - innerHeight / 2) * -speed;
      el.style.transform = axis === "y" ? `translate3d(0, ${off.toFixed(1)}px, 0)` : `translate3d(${off.toFixed(1)}px, 0, 0)`;
    };
    const on = () => { if (!visible) return; cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; on(); }, { rootMargin: "20% 0px" });
    io.observe(el);
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("scroll", on); removeEventListener("resize", on); };
  }, [speed, axis]);
  return <Tag ref={ref} className={className} style={{ willChange: "transform", ...style }}>{children}</Tag>;
}
