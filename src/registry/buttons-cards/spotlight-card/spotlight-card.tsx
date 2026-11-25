"use client";

import type { CSSProperties, ReactNode } from "react";

export type SpotlightCardProps = {
  children: ReactNode;
  /** Spotlight colour. */
  color?: string;
  /** Spotlight radius in px. */
  radius?: number;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-sc{position:relative;border-radius:20px;border:1px solid var(--au-border,rgb(255 255 255/.1));background:rgb(255 255 255/.03);overflow:hidden;isolation:isolate;padding:24px}
.au-sc::before{content:"";position:absolute;inset:0;z-index:-1;opacity:0;transition:opacity .35s;background:radial-gradient(var(--au-r) circle at var(--au-x,50%) var(--au-y,50%),var(--au-c),transparent 70%)}
.au-sc::after{content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;opacity:0;transition:opacity .35s;background:radial-gradient(calc(var(--au-r)*.8) circle at var(--au-x,50%) var(--au-y,50%),var(--au-c2),transparent 70%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0)}
.au-sc:hover::before,.au-sc:hover::after{opacity:1}`;

/** A card with a soft light and a glowing border that follow the cursor. */
export function SpotlightCard({ children, color = "#5cffc4", radius = 280, className, style }: SpotlightCardProps) {
  return (
    <div
      className={`au-sc ${className ?? ""}`}
      style={{ ["--au-c" as string]: `color-mix(in srgb, ${color} 16%, transparent)`, ["--au-c2" as string]: color, ["--au-r" as string]: `${radius}px`, ...style }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--au-x", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--au-y", `${e.clientY - r.top}px`);
      }}
    >
      <style>{CSS}</style>
      {children}
    </div>
  );
}
