"use client";

import type { CSSProperties, ReactNode } from "react";

export type ShimmerButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  /** Colour of the travelling light. */
  glow?: string;
  /** Face background. */
  background?: string;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-sb{position:relative;display:inline-flex;overflow:hidden;border-radius:999px;padding:1.5px;cursor:pointer;text-decoration:none;isolation:isolate;transition:transform .4s cubic-bezier(.16,1,.3,1)}
.au-sb:hover{transform:translateY(-2px)}
.au-sb::before{content:"";position:absolute;inset:-150%;z-index:-2;background:conic-gradient(from 0deg,transparent 0 70%,var(--au-glow) 90%,transparent 100%);animation:au-sb-spin 3s linear infinite}
.au-sb-f{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:13px 28px;font-weight:600;color:#fff;background:var(--au-face);position:relative;overflow:hidden}
.au-sb-f::after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 30%,rgb(255 255 255/.16) 50%,transparent 70%);transform:translateX(-120%);animation:au-sb-sweep 3.2s ease-in-out infinite}
@keyframes au-sb-spin{to{transform:rotate(360deg)}}
@keyframes au-sb-sweep{60%,100%{transform:translateX(120%)}}
@media (prefers-reduced-motion:reduce){.au-sb::before,.au-sb-f::after{animation:none}}`;

/** A pill with a light beam circling its border and a soft sweep across the face. */
export function ShimmerButton({ children, href, onClick, glow = "#5cffc4", background = "#0b1220", className, style }: ShimmerButtonProps) {
  const s = { ["--au-glow" as string]: glow, ["--au-face" as string]: background, ...style };
  const inner = <span className="au-sb-f">{children}</span>;
  return (
    <>
      <style>{CSS}</style>
      {href ? <a href={href} className={`au-sb ${className ?? ""}`} style={s}>{inner}</a> : <button type="button" onClick={onClick} className={`au-sb ${className ?? ""}`} style={s}>{inner}</button>}
    </>
  );
}
