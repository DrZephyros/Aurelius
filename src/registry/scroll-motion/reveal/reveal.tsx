"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

export type RevealProps = {
  children: ReactNode;
  variant?: "up" | "down" | "left" | "right" | "fade" | "scale" | "blur";
  /** ms */
  delay?: number;
  /** ms */
  duration?: number;
  /** Travel distance in px for directional variants. */
  distance?: number;
  /** Only animate the first time. */
  once?: boolean;
  /** 0–1 fraction of the element that must be visible. */
  threshold?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-rv{opacity:0;transform:var(--au-from);filter:var(--au-ff,none);transition:opacity var(--au-d) cubic-bezier(.16,1,.3,1) var(--au-del),transform var(--au-d) cubic-bezier(.16,1,.3,1) var(--au-del),filter var(--au-d) cubic-bezier(.16,1,.3,1) var(--au-del);will-change:opacity,transform}
.au-rv.au-in{opacity:1;transform:none;filter:none}
@media (prefers-reduced-motion:reduce){.au-rv{opacity:1;transform:none;filter:none;transition:none}}`;

/** Fade/slide/scale/blur children in when they scroll into view. Wrap anything. */
export function Reveal({ children, variant = "up", delay = 0, duration = 900, distance = 32, once = true, threshold = 0.15, as, className, style }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); if (once) io.disconnect(); } else if (!once) setOn(false); }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [once, threshold]);
  const from = { up: `translateY(${distance}px)`, down: `translateY(${-distance}px)`, left: `translateX(${distance}px)`, right: `translateX(${-distance}px)`, fade: "none", scale: "scale(.92)", blur: "translateY(12px)" }[variant];
  return (
    <>
      <style>{CSS}</style>
      <Tag ref={ref} className={`au-rv ${on ? "au-in" : ""} ${className ?? ""}`} style={{ ["--au-from" as string]: from, ["--au-ff" as string]: variant === "blur" ? "blur(14px)" : "none", ["--au-d" as string]: `${duration}ms`, ["--au-del" as string]: `${delay}ms`, ...style }}>
        {children}
      </Tag>
    </>
  );
}
