"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export type HighlightTextProps = {
  children: ReactNode;
  /** "marker" fills behind the text, "underline" draws a line beneath, "strike" crosses it out. */
  variant?: "marker" | "underline" | "strike";
  color?: string;
  /** ms before it draws after entering view. */
  delay?: number;
  /** ms to draw. */
  duration?: number;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-hl{background-repeat:no-repeat;background-size:0% var(--au-h);background-position:0 var(--au-y);-webkit-box-decoration-break:clone;box-decoration-break:clone;transition:background-size var(--au-d) cubic-bezier(.65,0,.15,1) var(--au-delay)}
.au-hl.au-on{background-size:100% var(--au-h)}
@media (prefers-reduced-motion:reduce){.au-hl{transition:none;background-size:100% var(--au-h)}}`;

const SHAPES = {
  marker: { h: "42%", y: "88%", pad: "0 .15em" },
  underline: { h: "0.1em", y: "100%", pad: "0" },
  strike: { h: "0.08em", y: "55%", pad: "0" },
} as const;

/** Draws a marker highlight, underline or strike-through behind inline text when it scrolls into view. */
export function HighlightText({ children, variant = "marker", color = "rgb(92 255 196 / 0.45)", delay = 150, duration = 800, className, style }: HighlightTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.8 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const s = SHAPES[variant];
  return (
    <>
      <style>{CSS}</style>
      <span
        ref={ref}
        className={`au-hl ${on ? "au-on" : ""} ${className ?? ""}`}
        style={{
          backgroundImage: `linear-gradient(${color},${color})`,
          padding: s.pad,
          ["--au-h" as string]: s.h,
          ["--au-y" as string]: s.y,
          ["--au-d" as string]: `${duration}ms`,
          ["--au-delay" as string]: `${delay}ms`,
          ...style,
        }}
      >
        {children}
      </span>
    </>
  );
}
