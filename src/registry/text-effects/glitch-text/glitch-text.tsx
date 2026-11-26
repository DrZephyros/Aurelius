"use client";

import type { CSSProperties, ElementType } from "react";

export type GlitchTextProps = {
  text: string;
  /** "hover" glitches on pointer over, "always" loops continuously. */
  active?: "hover" | "always";
  /** Colours of the two split layers. */
  colorA?: string;
  colorB?: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-gl{position:relative;display:inline-block}
.au-gl::before,.au-gl::after{content:attr(data-text);position:absolute;inset:0;pointer-events:none;opacity:0;mix-blend-mode:screen}
.au-gl::before{color:var(--au-a);clip-path:inset(0 0 52% 0)}
.au-gl::after{color:var(--au-b);clip-path:inset(52% 0 0 0)}
.au-gl[data-active="always"]::before,.au-gl[data-active="always"]::after,.au-gl[data-active="hover"]:hover::before,.au-gl[data-active="hover"]:hover::after{opacity:.9}
.au-gl[data-active="always"]::before,.au-gl[data-active="hover"]:hover::before{animation:au-gl1 .9s steps(1) infinite}
.au-gl[data-active="always"]::after,.au-gl[data-active="hover"]:hover::after{animation:au-gl2 .9s steps(1) infinite}
@keyframes au-gl1{0%{transform:translate(-3px,0);clip-path:inset(0 0 60% 0)}20%{transform:translate(3px,-1px);clip-path:inset(20% 0 35% 0)}40%{transform:translate(-2px,1px);clip-path:inset(5% 0 70% 0)}60%{transform:translate(4px,0);clip-path:inset(40% 0 20% 0)}80%{transform:translate(-4px,1px);clip-path:inset(10% 0 55% 0)}100%{transform:translate(-3px,0);clip-path:inset(0 0 60% 0)}}
@keyframes au-gl2{0%{transform:translate(3px,0);clip-path:inset(55% 0 0 0)}25%{transform:translate(-3px,1px);clip-path:inset(30% 0 30% 0)}50%{transform:translate(2px,-1px);clip-path:inset(70% 0 5% 0)}75%{transform:translate(-4px,0);clip-path:inset(45% 0 25% 0)}100%{transform:translate(3px,0);clip-path:inset(55% 0 0 0)}}
@media (prefers-reduced-motion:reduce){.au-gl::before,.au-gl::after{animation:none!important}}`;

/** RGB-split glitch on hover or on loop. */
export function GlitchText({ text, active = "hover", colorA = "#ff2d6f", colorB = "#00e5ff", as, className, style }: GlitchTextProps) {
  const Tag = (as ?? "span") as ElementType;
  return (
    <>
      <style>{CSS}</style>
      <Tag className={`au-gl ${className ?? ""}`} data-text={text} data-active={active} style={{ ["--au-a" as string]: colorA, ["--au-b" as string]: colorB, ...style }}>{text}</Tag>
    </>
  );
}
