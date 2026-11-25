"use client";

import { useEffect, useState, type CSSProperties } from "react";

export type RotatingWordsProps = {
  words: string[];
  /** ms each word stays. */
  interval?: number;
  /** Colour of the rotating word (default: accent). */
  color?: string;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-rw{display:inline-grid;vertical-align:bottom;overflow:hidden;padding-bottom:.12em;margin-bottom:-.12em}
.au-rw>span{grid-area:1/1;opacity:0;transform:translateY(100%);filter:blur(6px);transition:transform .7s cubic-bezier(.16,1,.3,1),opacity .5s,filter .5s}
.au-rw>.au-now{opacity:1;transform:none;filter:none}
.au-rw>.au-was{opacity:0;transform:translateY(-100%);filter:blur(6px)}
@media (prefers-reduced-motion:reduce){.au-rw>span{transition:none}}`;

/** Inline word that slides through a list. All words share one grid cell, so the width never jumps. */
export function RotatingWords({ words, interval = 2200, color = "var(--au-accent, #5cffc4)", className, style }: RotatingWordsProps) {
  const [i, setI] = useState(0);
  const key = words.join("|");
  useEffect(() => {
    if (words.length < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % words.length), interval);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, interval]);
  const prev = (i + words.length - 1) % words.length;
  return (
    <>
      <style>{CSS}</style>
      <span className={`au-rw ${className ?? ""}`} style={{ color, ...style }} aria-label={words[i]} aria-live="polite">
        {words.map((w, k) => (
          <span key={w + k} aria-hidden className={k === i ? "au-now" : k === prev ? "au-was" : ""}>{w}</span>
        ))}
      </span>
    </>
  );
}
