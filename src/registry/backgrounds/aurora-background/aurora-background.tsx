"use client";

import type { CSSProperties, ReactNode } from "react";

export type AuroraBackgroundProps = {
  /** Up to 4 blob colours. */
  colors?: string[];
  /** Blur radius in px. */
  blur?: number;
  /** 0–1 */
  intensity?: number;
  /** Faint grid overlay, masked to the centre. */
  grid?: boolean;
  /** Section background colour. */
  background?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-ab{position:relative;overflow:hidden;isolation:isolate}
.au-ab-l{position:absolute;inset:-20%;z-index:-1;filter:blur(var(--au-blur));opacity:var(--au-int);pointer-events:none}
.au-ab-l i{position:absolute;width:46%;height:46%;border-radius:50%;mix-blend-mode:screen}
.au-ab-l i:nth-child(1){left:2%;top:10%;animation:au-ab1 18s ease-in-out infinite alternate}
.au-ab-l i:nth-child(2){right:4%;top:0;animation:au-ab2 22s ease-in-out infinite alternate}
.au-ab-l i:nth-child(3){left:28%;bottom:0;animation:au-ab3 26s ease-in-out infinite alternate}
.au-ab-l i:nth-child(4){right:24%;bottom:12%;width:30%;height:30%;animation:au-ab1 30s ease-in-out infinite alternate-reverse}
.au-ab-g{position:absolute;inset:0;z-index:-1;pointer-events:none;background-image:linear-gradient(rgb(255 255 255/.06) 1px,transparent 1px),linear-gradient(90deg,rgb(255 255 255/.06) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:radial-gradient(70% 60% at 50% 40%,#000,transparent);mask-image:radial-gradient(70% 60% at 50% 40%,#000,transparent)}
@keyframes au-ab1{to{transform:translate(18%,12%) scale(1.25)}}
@keyframes au-ab2{to{transform:translate(-22%,18%) scale(.85)}}
@keyframes au-ab3{to{transform:translate(14%,-20%) scale(1.15)}}
@media (prefers-reduced-motion:reduce){.au-ab-l i{animation:none!important}}`;

/** Slow-drifting aurora blobs behind your content. Put the hero / section content inside as children. */
export function AuroraBackground({ colors = ["#5cffc4", "#3de7ff", "#a58bff", "#ff7ad9"], blur = 90, intensity = 0.55, grid = true, background = "#04060c", children, className, style }: AuroraBackgroundProps) {
  return (
    <div className={`au-ab ${className ?? ""}`} style={{ background, ["--au-blur" as string]: `${blur}px`, ["--au-int" as string]: intensity, ...style }}>
      <style>{CSS}</style>
      <div className="au-ab-l" aria-hidden>
        {colors.slice(0, 4).map((c, i) => <i key={i} style={{ background: `radial-gradient(circle, ${c}, transparent 68%)` }} />)}
      </div>
      {grid && <div className="au-ab-g" aria-hidden />}
      {children}
    </div>
  );
}
