"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType } from "react";

export type SplitRevealProps = {
  text: string;
  /** Split into words (default) or individual characters. */
  by?: "word" | "char";
  /** Delay between pieces in ms. */
  stagger?: number;
  /** Duration of each piece in ms. */
  duration?: number;
  /** Fade in from a blur. */
  blur?: boolean;
  /** Replay every time it re-enters the viewport. */
  once?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-sr-c{display:inline-block;opacity:0;transform:translateY(.55em);filter:blur(var(--au-b));transition:opacity var(--au-d) cubic-bezier(.16,1,.3,1),transform var(--au-d) cubic-bezier(.16,1,.3,1),filter var(--au-d) cubic-bezier(.16,1,.3,1)}
.au-sr.au-on .au-sr-c{opacity:1;transform:none;filter:none}
@media (prefers-reduced-motion:reduce){.au-sr-c{transition:none;opacity:1;transform:none;filter:none}}`;

/** Staggered word / character reveal when the text scrolls into view. */
export function SplitReveal({ text, by = "word", stagger = 55, duration = 900, blur = true, once = true, as, className, style }: SplitRevealProps) {
  const Tag = (as ?? "span") as ElementType;
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); if (once) io.disconnect(); } else if (!once) setOn(false);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  let n = 0;
  return (
    <>
      <style>{CSS}</style>
      <Tag
        ref={ref}
        aria-label={text}
        className={`au-sr ${on ? "au-on" : ""} ${className ?? ""}`}
        style={{ ["--au-d" as string]: `${duration}ms`, ["--au-b" as string]: blur ? "10px" : "0px", ...style }}
      >
        {text.split(" ").map((w, wi, all) => (
          <span key={wi} aria-hidden style={{ display: "inline-block", whiteSpace: "pre" }}>
            {(by === "char" ? w.split("") : [w]).map((p, i) => (
              <span key={i} className="au-sr-c" style={{ transitionDelay: `${n++ * stagger}ms` }}>{p}</span>
            ))}
            {wi < all.length - 1 ? " " : ""}
          </span>
        ))}
      </Tag>
    </>
  );
}
