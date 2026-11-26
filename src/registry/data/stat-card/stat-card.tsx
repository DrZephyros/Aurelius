"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export type StatCardProps = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Change vs. the previous period, in percent. Positive = good (green). */
  delta?: number;
  /** Optional trend line values. */
  trend?: number[];
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-kc{padding:22px;border-radius:22px;border:1px solid var(--au-border,rgb(255 255 255/.1));background:linear-gradient(180deg,rgb(255 255 255/.05),rgb(255 255 255/.015));transition:transform .4s cubic-bezier(.16,1,.3,1),border-color .3s}.au-kc:hover{transform:translateY(-3px);border-color:rgb(255 255 255/.2)}`;

/** KPI tile: label, rolling number, delta badge and a mini trend line. */
export function StatCard({ label, value, prefix = "", suffix = "", decimals = 0, delta, trend, className, style }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(value);
  const [line, setLine] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect(); setLine(true);
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const t0 = performance.now();
      const tick = (t: number) => { const k = Math.min(1, (t - t0) / 1500); setV(value * (1 - Math.pow(1 - k, 4))); if (k < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    setV(0); setLine(false);
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);

  const up = (delta ?? 0) >= 0;
  const col = up ? "#5cffc4" : "#ff6b81";
  let path = "";
  if (trend && trend.length > 1) {
    const mn = Math.min(...trend), mx = Math.max(...trend);
    path = trend.map((t, i) => `${i ? "L" : "M"}${(i / (trend.length - 1)) * 100},${28 - ((t - mn) / (mx - mn || 1)) * 24}`).join(" ");
  }
  return (
    <div ref={ref} className={`au-kc ${className ?? ""}`} style={style}>
      <style>{CSS}</style>
      <div style={{ fontSize: 13, opacity: 0.6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 10 }}>
        <div style={{ fontSize: 34, fontWeight: 650, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{prefix}{v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</div>
        {path && (
          <svg width="96" height="32" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden>
            <path d={path} fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray={1} strokeDashoffset={line ? 0 : 1} style={{ transition: "stroke-dashoffset 1.3s cubic-bezier(.65,0,.15,1)" }} />
          </svg>
        )}
      </div>
      {delta !== undefined && <div style={{ marginTop: 12, fontSize: 12.5, color: col }}>{up ? "▲" : "▼"} {Math.abs(delta)}% <span style={{ opacity: 0.45, color: "inherit" }}>vs last period</span></div>}
    </div>
  );
}
