"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";

export type ShimmerTextProps = {
  children: ReactNode;
  /** "shimmer": a highlight sweeps across muted text. "flow": a colour gradient glides through the text. */
  mode?: "shimmer" | "flow";
  /** shimmer: base colour. */
  from?: string;
  /** shimmer: highlight colour. */
  via?: string;
  /** flow: gradient stops. */
  colors?: string[];
  /** Seconds per loop. */
  speed?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-shim{background-clip:text;-webkit-background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:au-shim var(--au-speed) linear infinite}
.au-shim-s{background-image:linear-gradient(110deg,var(--au-from) 35%,var(--au-via) 50%,var(--au-from) 65%);background-size:250% 100%}
.au-shim-f{background-size:300% 100%;animation-name:au-flow}
@keyframes au-shim{from{background-position:150% 0}to{background-position:-100% 0}}
@keyframes au-flow{from{background-position:0 0}to{background-position:-300% 0}}
@media (prefers-reduced-motion:reduce){.au-shim{animation:none}}`;

/** Animated gradient text. Wrap any inline or block content. */
export function ShimmerText({ children, mode = "shimmer", from = "#7d8aa0", via = "#ffffff", colors = ["#5cffc4", "#3de7ff", "#a58bff", "#ff7ad9", "#5cffc4"], speed, as, className, style }: ShimmerTextProps) {
  const Tag = (as ?? "span") as ElementType;
  const flow = mode === "flow";
  const s: CSSProperties = {
    ["--au-from" as string]: from,
    ["--au-via" as string]: via,
    ["--au-speed" as string]: `${speed ?? (flow ? 6 : 2.8)}s`,
    ...(flow ? { backgroundImage: `linear-gradient(90deg, ${[...colors, colors[0]].join(",")})` } : null),
    ...style,
  };
  return (
    <>
      <style>{CSS}</style>
      <Tag className={`au-shim ${flow ? "au-shim-f" : "au-shim-s"} ${className ?? ""}`} style={s}>{children}</Tag>
    </>
  );
}
