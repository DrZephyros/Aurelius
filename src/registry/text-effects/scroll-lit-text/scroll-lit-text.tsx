"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";

export type ScrollLitTextProps = {
  /** Text. Wrap words in *asterisks* to give them the glowing accent treatment. */
  text: string;
  /** Glow / accent colour (CSS colour). */
  accent?: string;
  className?: string;
  style?: CSSProperties;
};

/** A paragraph whose words ignite one after another as you scroll it into the centre of the screen. */
export function ScrollLitText({ text, accent = "#5cffc4", className, style }: ScrollLitTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = useMemo(() => text.split(" ").map((w) => ({ w: w.replace(/\*/g, ""), em: w.includes("*") })), [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = [...el.querySelectorAll<HTMLElement>("[data-w]")];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const paint = () => {
      const r = el.getBoundingClientRect();
      const k = reduce ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.78 - r.top) / (r.height + innerHeight * 0.1)));
      spans.forEach((s, i) => {
        const lit = Math.min(1, Math.max(0, k * 1.25 * spans.length - i) / 1.5);
        s.style.opacity = String(0.16 + 0.84 * lit);
        if (s.dataset.em) { s.style.color = accent; s.style.textShadow = `0 0 ${34 * lit}px ${accent}`; }
      });
    };
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); };
    paint();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", on); removeEventListener("resize", on); };
  }, [words, accent]);

  return (
    <p ref={ref} className={className} style={style}>
      {words.map((x, i) => (
        <span key={i} data-w data-em={x.em ? "1" : undefined} style={{ opacity: 0.16, transition: "opacity .25s linear" }}>{x.w}{" "}</span>
      ))}
    </p>
  );
}
