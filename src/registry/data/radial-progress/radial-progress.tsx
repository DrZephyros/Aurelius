"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";

export type RadialProgressProps = {
  /** 0–100 */
  value: number;
  size?: number;
  thickness?: number;
  /** Gradient stops for the arc. */
  colors?: [string, string];
  /** Center content. Defaults to the percentage. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** Circular progress / score ring that animates to its value when in view. */
export function RadialProgress({ value, size = 140, thickness = 10, colors = ["#5cffc4", "#a58bff"], children, className, style }: RadialProgressProps) {
  const id = useId().replace(/:/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!on) return;
    let raf = 0;
    const t0 = performance.now(), from = n;
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / 1400); setN(from + (value - from) * (1 - Math.pow(1 - k, 4))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, value]);
  const r = (size - thickness) / 2, c = 2 * Math.PI * r;
  const v = Math.min(100, Math.max(0, value));
  return (
    <div ref={ref} className={className} style={{ position: "relative", width: size, height: size, ...style }} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={colors[0]} /><stop offset="1" stopColor={colors[1]} /></linearGradient></defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(255 255 255/.1)" strokeWidth={thickness} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={thickness} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - (on ? n : 0) / 100)} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontWeight: 650, fontSize: size * 0.24, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>{children ?? `${Math.round(n)}%`}</div>
    </div>
  );
}
