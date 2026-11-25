"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

export type FlipCardProps = {
  front: ReactNode;
  back: ReactNode;
  /** "hover" flips on pointer over; "click" toggles on click / Enter / Space. */
  trigger?: "hover" | "click";
  /** Flip around the vertical (default) or horizontal axis. */
  axis?: "y" | "x";
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-fc{perspective:1000px;display:block}
.au-fc-i{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .8s cubic-bezier(.16,1,.3,1)}
.au-fc-f,.au-fc-b{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:inherit;overflow:hidden}
.au-fc-b{transform:var(--au-back)}
@media (prefers-reduced-motion:reduce){.au-fc-i{transition:none}}`;

/** Two-sided card with a smooth 3D flip. Give it a width and height. */
export function FlipCard({ front, back, trigger = "hover", axis = "y", className, style }: FlipCardProps) {
  const [on, setOn] = useState(false);
  const rot = axis === "y" ? "rotateY" : "rotateX";
  return (
    <div
      className={`au-fc ${className ?? ""}`}
      style={{ width: 280, height: 180, borderRadius: 18, cursor: "pointer", ["--au-back" as string]: `${rot}(180deg)`, ...style }}
      role={trigger === "click" ? "button" : undefined}
      tabIndex={0}
      aria-pressed={trigger === "click" ? on : undefined}
      onMouseEnter={trigger === "hover" ? () => setOn(true) : undefined}
      onMouseLeave={trigger === "hover" ? () => setOn(false) : undefined}
      onFocus={trigger === "hover" ? () => setOn(true) : undefined}
      onBlur={trigger === "hover" ? () => setOn(false) : undefined}
      onClick={trigger === "click" ? () => setOn((v) => !v) : undefined}
      onKeyDown={trigger === "click" ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOn((v) => !v); } } : undefined}
    >
      <style>{CSS}</style>
      <div className="au-fc-i" style={{ transform: on ? `${rot}(180deg)` : "none" }}>
        <div className="au-fc-f">{front}</div>
        <div className="au-fc-b">{back}</div>
      </div>
    </div>
  );
}
