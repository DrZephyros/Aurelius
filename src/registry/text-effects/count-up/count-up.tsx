"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export type CountUpProps = {
  to: number;
  from?: number;
  /** ms */
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  /** Locale for digit grouping, e.g. "en-US". Pass "" to disable grouping. */
  locale?: string;
  className?: string;
  style?: CSSProperties;
};

/** Number that eases from `from` to `to` when scrolled into view. */
export function CountUp({ to, from = 0, duration = 1800, decimals = 0, prefix = "", suffix = "", locale = "en-US", className, style }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(to);
  const fmt = (n: number) => (locale ? n.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : n.toFixed(decimals));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    setV(from);
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / duration);
        setV(from + (to - from) * (k === 1 ? 1 : 1 - Math.pow(2, -10 * k)));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, from, duration]);

  return <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums", ...style }}>{prefix}{fmt(v)}{suffix}</span>;
}
