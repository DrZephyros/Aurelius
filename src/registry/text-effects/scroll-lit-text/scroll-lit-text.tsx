"use client";

import { useEffect, useMemo, useRef, type CSSProperties } from "react";

export type ScrollLitTextProps = {
  /** Text. Wrap words in *asterisks* to give them the glowing accent treatment. */
  text: string;
  /** Glow / accent colour (CSS colour). */
  accent?: string;
  /** Scroll container to track (element or CSS selector). Default: the nearest scrollable ancestor, else the page. */
  scroller?: HTMLElement | string | null;
  className?: string;
  style?: CSSProperties;
};

/** Nearest ancestor that actually scrolls vertically (null → the window). */
function scrollParent(el: HTMLElement): HTMLElement | null {
  for (let p = el.parentElement; p; p = p.parentElement) {
    if (/(auto|scroll|overlay)/.test(getComputedStyle(p).overflowY) && p.scrollHeight > p.clientHeight + 1) return p;
  }
  return null;
}

/** A paragraph whose words ignite one after another as it travels up through the viewport (or through a scroll container). */
export function ScrollLitText({ text, accent = "#5cffc4", scroller, className, style }: ScrollLitTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = useMemo(() => text.split(" ").map((w) => ({ w: w.replace(/\*/g, ""), em: w.includes("*") })), [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = [...el.querySelectorAll<HTMLElement>("[data-w]")];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const paint = () => {
      const box = typeof scroller === "string" ? document.querySelector<HTMLElement>(scroller) : scroller ?? scrollParent(el);
      const vr = box ? box.getBoundingClientRect() : { top: 0, height: innerHeight };
      const r = el.getBoundingClientRect();
      const k = reduce ? 1 : Math.min(1, Math.max(0, (vr.top + vr.height * 0.8 - r.top) / (r.height + vr.height * 0.35)));
      spans.forEach((s, i) => {
        const lit = Math.min(1, Math.max(0, k * 1.25 * spans.length - i) / 1.5);
        s.style.opacity = String(0.16 + 0.84 * lit);
        if (s.dataset.em) { s.style.color = accent; s.style.textShadow = `0 0 ${34 * lit}px ${accent}`; }
      });
    };
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); };
    paint();
    // capture: catches scroll events from the page *and* from any inner scroll container
    addEventListener("scroll", on, { passive: true, capture: true });
    addEventListener("resize", on);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", on, { capture: true }); removeEventListener("resize", on); };
  }, [words, accent, scroller]);

  return (
    <p ref={ref} className={className} style={style}>
      {words.map((x, i) => (
        <span key={i} data-w data-em={x.em ? "1" : undefined} style={{ opacity: 0.16, transition: "opacity .25s linear" }}>{x.w}{" "}</span>
      ))}
    </p>
  );
}
