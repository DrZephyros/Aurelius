"use client";

import type { CSSProperties, ReactNode } from "react";

export type MarqueeProps = {
  children: ReactNode;
  /** Seconds for one full loop (lower = faster). */
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  vertical?: boolean;
  /** Gap between items (px). */
  gap?: number;
  /** Fade the edges. */
  fade?: boolean;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-mq{display:flex;overflow:hidden;gap:var(--au-gap);user-select:none}
.au-mq.au-v{flex-direction:column}
.au-mq-t{display:flex;flex-shrink:0;gap:var(--au-gap);min-width:100%;align-items:center;justify-content:space-around;animation:au-mq var(--au-dur) linear infinite;animation-direction:var(--au-dir)}
.au-v .au-mq-t{flex-direction:column;min-width:0;min-height:100%;animation-name:au-mqv}
.au-mq.au-p:hover .au-mq-t{animation-play-state:paused}
@keyframes au-mq{to{transform:translateX(calc(-100% - var(--au-gap)))}}
@keyframes au-mqv{to{transform:translateY(calc(-100% - var(--au-gap)))}}
@media (prefers-reduced-motion:reduce){.au-mq-t{animation:none}}`;

/** Seamless infinite loop. Content is duplicated once (the copy is aria-hidden). */
export function Marquee({ children, duration = 30, reverse, pauseOnHover = true, vertical, gap = 32, fade = true, className, style }: MarqueeProps) {
  const mask = fade ? `linear-gradient(${vertical ? "180deg" : "90deg"},transparent,#000 12%,#000 88%,transparent)` : undefined;
  return (
    <div
      className={`au-mq ${vertical ? "au-v" : ""} ${pauseOnHover ? "au-p" : ""} ${className ?? ""}`}
      style={{ ["--au-gap" as string]: `${gap}px`, ["--au-dur" as string]: `${duration}s`, ["--au-dir" as string]: reverse ? "reverse" : "normal", WebkitMaskImage: mask, maskImage: mask, ...style }}
    >
      <style>{CSS}</style>
      <div className="au-mq-t">{children}</div>
      <div className="au-mq-t" aria-hidden>{children}</div>
    </div>
  );
}
