"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ElementType } from "react";

export type ScrambleTextProps = {
  /** The final text that the effect resolves to. */
  text: string;
  /** Element to render. Default "span". */
  as?: ElementType;
  /** "view" runs when scrolled into view, "hover" on pointer enter, "mount" immediately. */
  trigger?: "view" | "hover" | "mount";
  /** Total duration in ms. */
  duration?: number;
  /** Characters used for the noise. */
  chars?: string;
  className?: string;
  style?: CSSProperties;
};

/** Decodes text from random characters, left to right. Great for headings, stats and hover labels. */
export function ScrambleText({ text, as, trigger = "view", duration = 1000, chars = "!<>-_\\/[]{}—=+*^?#0123456789", className, style }: ScrambleTextProps) {
  const Tag = (as ?? "span") as ElementType;
  const [out, setOut] = useState(text);
  const ref = useRef<HTMLElement>(null);
  const raf = useRef(0);

  const run = useCallback(() => {
    cancelAnimationFrame(raf.current);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return setOut(text);
    const n = text.length;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / duration);
      setOut(text.split("").map((c, i) => (c === " " || k * 1.3 * n - i > 1 ? c : chars[(Math.random() * chars.length) | 0])).join(""));
      if (k < 1) raf.current = requestAnimationFrame(tick);
      else setOut(text);
    };
    raf.current = requestAnimationFrame(tick);
  }, [text, duration, chars]);

  useEffect(() => {
    if (trigger === "mount") run();
    if (trigger !== "view" || !ref.current) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { run(); io.disconnect(); } }, { threshold: 0.6 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [trigger, run]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <Tag ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums", ...style }} aria-label={text} onMouseEnter={trigger === "hover" ? run : undefined}>
      <span aria-hidden>{out}</span>
    </Tag>
  );
}
