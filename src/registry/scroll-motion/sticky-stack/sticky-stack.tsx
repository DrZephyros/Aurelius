"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export type StickyStackProps = {
  /** One element per card. Each should fill its box and bring its own background. */
  cards: ReactNode[];
  /** Card height (CSS length). */
  cardHeight?: string;
  /** Distance from the top where the stack pins (px). */
  top?: number;
  /** Vertical offset between pinned cards (px). */
  peek?: number;
  className?: string;
  style?: CSSProperties;
};

/** Cards that pin and stack on top of each other while scrolling, shrinking and dimming as the next arrives. */
export function StickyStack({ cards, cardHeight = "62vh", top = 96, peek = 22, className, style }: StickyStackProps) {
  const wraps = useRef<(HTMLDivElement | null)[]>([]);
  const inners = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const paint = () => {
      wraps.current.forEach((w, i) => {
        const next = wraps.current[i + 1], inner = inners.current[i];
        if (!w || !next || !inner) return;
        const pin = top + i * peek, h = w.offsetHeight;
        const k = Math.min(1, Math.max(0, (h - (next.getBoundingClientRect().top - pin)) / h));
        inner.style.transform = `scale(${1 - k * 0.06})`;
        inner.style.filter = `brightness(${1 - k * 0.4})`;
      });
    };
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); };
    paint();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", on); removeEventListener("resize", on); };
  }, [top, peek, cards.length]);

  return (
    <div className={className} style={style}>
      {cards.map((c, i) => (
        <div key={i} ref={(el) => { wraps.current[i] = el; }} style={{ position: "sticky", top: top + i * peek, height: cardHeight, marginBottom: i < cards.length - 1 ? 40 : 0 }}>
          <div ref={(el) => { inners.current[i] = el; }} style={{ height: "100%", borderRadius: 28, overflow: "hidden", transformOrigin: "50% 0", willChange: "transform, filter", boxShadow: "0 -20px 60px -20px rgb(0 0 0/.55)" }}>{c}</div>
        </div>
      ))}
    </div>
  );
}
