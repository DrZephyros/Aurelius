"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export type BarDatum = { label: string; value: number };
export type BarChartProps = { data: BarDatum[]; height?: number; color?: string; /** Format the value shown on hover. */ format?: (v: number) => string; className?: string; style?: CSSProperties };

const CSS = `.au-bc{display:flex;align-items:flex-end;gap:10px}
.au-bc-c{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;height:100%;justify-content:flex-end;position:relative}
.au-bc-b{width:100%;max-width:56px;border-radius:10px 10px 4px 4px;background:linear-gradient(180deg,var(--au-c),color-mix(in srgb,var(--au-c) 35%,transparent));transform-origin:50% 100%;transform:scaleY(0);transition:transform 1s cubic-bezier(.16,1,.3,1) var(--au-d),filter .2s;min-height:3px}
.au-bc.au-go .au-bc-b{transform:scaleY(1)}.au-bc-c:hover .au-bc-b{filter:brightness(1.25)}
.au-bc-v{position:absolute;top:var(--au-top);font-size:12px;font-weight:600;opacity:0;transform:translateY(4px);transition:all .2s;pointer-events:none;white-space:nowrap}.au-bc-c:hover .au-bc-v{opacity:1;transform:none}
.au-bc-l{font-size:12px;opacity:.55;white-space:nowrap}
@media (prefers-reduced-motion:reduce){.au-bc-b{transition:none;transform:none}}`;

/** Animated, dependency-free bar chart. Bars grow in when scrolled into view; hover shows the value. */
export function BarChart({ data, height = 220, color = "#5cffc4", format = (v) => v.toLocaleString(), className, style }: BarChartProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const max = Math.max(...data.map((d) => d.value), 1);
  const plot = height - 28;
  return (
    <div ref={ref} className={`au-bc ${go ? "au-go" : ""} ${className ?? ""}`} style={{ height, ["--au-c" as string]: color, ...style }} role="img" aria-label={data.map((d) => `${d.label}: ${d.value}`).join(", ")}>
      <style>{CSS}</style>
      {data.map((d, i) => {
        const h = (d.value / max) * plot;
        return (
          <div key={d.label} className="au-bc-c">
            <span className="au-bc-v" style={{ ["--au-top" as string]: `${plot - h - 22}px`, color }}>{format(d.value)}</span>
            <div className="au-bc-b" style={{ height: h, ["--au-d" as string]: `${i * 70}ms` }} />
            <span className="au-bc-l">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
