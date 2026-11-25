"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";

export type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  /** Gradient area under the line. */
  fill?: boolean;
  /** Draw the line in when scrolled into view. */
  animate?: boolean;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
};

/** Tiny smooth line chart (inline SVG, zero dependencies) that draws itself in. */
export function Sparkline({ data, width = 160, height = 44, color = "#5cffc4", fill = true, animate = true, strokeWidth = 2, className, style }: SparklineProps) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [on, setOn] = useState(!animate);
  useEffect(() => {
    if (!animate || !ref.current) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [animate]);

  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data), pad = strokeWidth + 1;
  const pts = data.map((v, i) => [pad + (i / (data.length - 1)) * (width - pad * 2), pad + (1 - (v - min) / (max - min || 1)) * (height - pad * 2)] as const);
  // Catmull-Rom → cubic Bézier for a smooth curve
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  const last = pts[pts.length - 1];
  return (
    <svg ref={ref} width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} style={{ overflow: "visible", ...style }} role="img" aria-label={`Trend from ${data[0]} to ${data[data.length - 1]}`}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity=".35" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      {fill && <path d={`${d} L${last[0]},${height} L${pts[0][0]},${height} Z`} fill={`url(#${id})`} style={{ opacity: on ? 1 : 0, transition: "opacity 1s .5s" }} />}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={on ? 0 : 1} style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.65,0,.15,1)" }} />
      <circle cx={last[0]} cy={last[1]} r={3} fill={color} style={{ opacity: on ? 1 : 0, transition: "opacity .4s 1.2s" }} />
    </svg>
  );
}
