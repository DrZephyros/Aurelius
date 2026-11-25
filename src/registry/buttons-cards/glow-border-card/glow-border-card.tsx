"use client";

import type { CSSProperties, ReactNode } from "react";

export type GlowBorderCardProps = {
  children: ReactNode;
  /** Gradient stops for the travelling border. */
  colors?: string[];
  /** Seconds per rotation. */
  speed?: number;
  /** Card face colour. */
  background?: string;
  /** Border thickness in px. */
  border?: number;
  /** Soft outer glow. */
  glow?: boolean;
  className?: string;
  style?: CSSProperties;
};

const CSS = `@property --au-angle{syntax:"<angle>";inherits:false;initial-value:0deg}
.au-gb{position:relative;border-radius:20px;border:var(--au-bw) solid transparent;background:linear-gradient(var(--au-face),var(--au-face)) padding-box,conic-gradient(from var(--au-angle),var(--au-stops)) border-box;animation:au-gb-spin var(--au-sp) linear infinite;padding:24px}
.au-gb-glow::before{content:"";position:absolute;inset:-1px;z-index:-1;border-radius:inherit;background:conic-gradient(from var(--au-angle),var(--au-stops));filter:blur(22px);opacity:.35}
@keyframes au-gb-spin{to{--au-angle:360deg}}
@media (prefers-reduced-motion:reduce){.au-gb{animation:none}}`;

/** A card whose border is a slowly rotating gradient. */
export function GlowBorderCard({ children, colors = ["#5cffc4", "#3de7ff", "#a58bff", "#ff7ad9"], speed = 6, background = "#0a0e17", border = 1.5, glow = true, className, style }: GlowBorderCardProps) {
  return (
    <div
      className={`au-gb ${glow ? "au-gb-glow" : ""} ${className ?? ""}`}
      style={{ ["--au-stops" as string]: [...colors, colors[0]].join(","), ["--au-sp" as string]: `${speed}s`, ["--au-face" as string]: background, ["--au-bw" as string]: `${border}px`, ...style }}
    >
      <style>{CSS}</style>
      {children}
    </div>
  );
}
