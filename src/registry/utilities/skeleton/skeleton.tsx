"use client";

import type { CSSProperties } from "react";

export type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  /** Border radius (px or CSS). Use 999 for circles/pills. */
  radius?: number | string;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-sk{display:block;position:relative;overflow:hidden;background:rgb(255 255 255/.07)}
.au-sk::after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgb(255 255 255/.09),transparent);animation:au-sk 1.5s infinite}
@keyframes au-sk{to{transform:translateX(100%)}}@media (prefers-reduced-motion:reduce){.au-sk::after{animation:none}}`;

/** A shimmering placeholder block. Compose several to mirror the layout that is loading. */
export function Skeleton({ width = "100%", height = 16, radius = 8, className, style }: SkeletonProps) {
  return (
    <>
      <style>{CSS}</style>
      <span aria-hidden className={`au-sk ${className ?? ""}`} style={{ width, height, borderRadius: radius, ...style }} />
    </>
  );
}

/** Paragraph placeholder: `lines` bars, the last one shorter. */
export function SkeletonText({ lines = 3, gap = 10 }: { lines?: number; gap?: number }) {
  return (
    <div role="status" aria-label="Loading" style={{ display: "grid", gap }}>
      {Array.from({ length: lines }, (_, i) => <Skeleton key={i} height={13} width={i === lines - 1 ? "62%" : "100%"} />)}
    </div>
  );
}
