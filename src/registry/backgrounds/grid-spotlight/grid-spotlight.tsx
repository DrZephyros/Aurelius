"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";

export type GridSpotlightProps = {
  /** Grid cell size in px. */
  cell?: number;
  /** Spotlight radius in px. */
  radius?: number;
  lineColor?: string;
  glowColor?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-gs{position:relative;overflow:hidden;isolation:isolate}
.au-gs>.au-gs-a,.au-gs>.au-gs-b{position:absolute;inset:0;z-index:-1;pointer-events:none;background-size:var(--au-cell) var(--au-cell)}
.au-gs>.au-gs-a{background-image:linear-gradient(var(--au-line) 1px,transparent 1px),linear-gradient(90deg,var(--au-line) 1px,transparent 1px)}
.au-gs>.au-gs-b{background-image:linear-gradient(var(--au-glow) 1px,transparent 1px),linear-gradient(90deg,var(--au-glow) 1px,transparent 1px);-webkit-mask-image:radial-gradient(var(--au-r) circle at var(--au-x,50%) var(--au-y,40%),#000,transparent);mask-image:radial-gradient(var(--au-r) circle at var(--au-x,50%) var(--au-y,40%),#000,transparent);opacity:0;transition:opacity .4s}
.au-gs:hover>.au-gs-b{opacity:1}`;

/** A faint grid that lights up under the cursor. Pure CSS masks, one pointer listener. */
export function GridSpotlight({ cell = 48, radius = 260, lineColor = "rgba(255,255,255,0.06)", glowColor = "rgba(92,255,196,0.55)", children, className, style }: GridSpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`au-gs ${className ?? ""}`}
      style={{ ["--au-cell" as string]: `${cell}px`, ["--au-r" as string]: `${radius}px`, ["--au-line" as string]: lineColor, ["--au-glow" as string]: glowColor, ...style }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--au-x", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--au-y", `${e.clientY - r.top}px`);
      }}
    >
      <style>{CSS}</style>
      <div className="au-gs-a" aria-hidden />
      <div className="au-gs-b" aria-hidden />
      {children}
    </div>
  );
}
