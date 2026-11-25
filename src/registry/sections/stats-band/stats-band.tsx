"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export type Stat = { value: number; label: string; prefix?: string; suffix?: string; decimals?: number };
export type StatsBandProps = { stats: Stat[]; className?: string; style?: CSSProperties };

const CSS = `.au-sb2{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));border-radius:28px;border:1px solid var(--au-border,rgb(255 255 255/.1));background:rgb(255 255 255/.03);overflow:hidden}
.au-sb2>div{padding:34px 28px;border-right:1px solid var(--au-border,rgb(255 255 255/.1))}.au-sb2>div:last-child{border-right:0}
.au-sb2 b{display:block;font-size:clamp(2.2rem,4.4vw,3.4rem);font-weight:650;letter-spacing:-.05em;font-variant-numeric:tabular-nums;line-height:1}
.au-sb2 span{display:block;margin-top:10px;font-size:13px;opacity:.55;letter-spacing:.04em}
@media(max-width:640px){.au-sb2>div{border-right:0;border-bottom:1px solid var(--au-border,rgb(255 255 255/.1))}}`;

function Num({ s, go }: { s: Stat; go: boolean }) {
  const [v, setV] = useState(s.value);
  useEffect(() => {
    if (!go || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (n: number) => { const k = Math.min(1, (n - t0) / 1800); setV(s.value * (k === 1 ? 1 : 1 - Math.pow(2, -10 * k))); if (k < 1) raf = requestAnimationFrame(tick); };
    setV(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [go, s.value]);
  return <>{s.prefix}{v.toLocaleString("en-US", { minimumFractionDigits: s.decimals ?? 0, maximumFractionDigits: s.decimals ?? 0 })}{s.suffix}</>;
}

/** A row of big numbers that count up when scrolled into view. */
export function StatsBand({ stats, className, style }: StatsBandProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [go, setGo] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`au-sb2 ${className ?? ""}`} style={style}>
      <style>{CSS}</style>
      {stats.map((s) => <div key={s.label}><b><Num s={s} go={go} /></b><span>{s.label}</span></div>)}
    </div>
  );
}
