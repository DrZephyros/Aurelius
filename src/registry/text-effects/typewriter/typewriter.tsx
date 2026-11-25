"use client";

import { useEffect, useState, type CSSProperties } from "react";

export type TypewriterProps = {
  phrases: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  /** ms to hold a finished phrase. */
  pause?: number;
  /** Loop forever; if false it stops on the last phrase. */
  loop?: boolean;
  cursor?: string;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-tw-c{display:inline-block;margin-left:2px;animation:au-tw 1s steps(1) infinite}@keyframes au-tw{50%{opacity:0}}@media (prefers-reduced-motion:reduce){.au-tw-c{animation:none}}`;

/** Types, holds, deletes and moves on to the next phrase. */
export function Typewriter({ phrases, typeSpeed = 55, deleteSpeed = 28, pause = 1500, loop = true, cursor = "▍", className, style }: TypewriterProps) {
  const [txt, setTxt] = useState(phrases[0] ?? "");
  const key = phrases.join("|");

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0, j = 0, del = false;
    let t: ReturnType<typeof setTimeout>;
    setTxt("");
    const tick = () => {
      const w = phrases[i];
      if (!del) {
        setTxt(w.slice(0, ++j));
        if (j === w.length) {
          if (!loop && i === phrases.length - 1) return;
          del = true;
          t = setTimeout(tick, pause);
        } else t = setTimeout(tick, typeSpeed * (0.6 + Math.random() * 0.8));
      } else {
        setTxt(w.slice(0, --j));
        if (j === 0) { del = false; i = (i + 1) % phrases.length; t = setTimeout(tick, 300); }
        else t = setTimeout(tick, deleteSpeed);
      }
    };
    t = setTimeout(tick, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, typeSpeed, deleteSpeed, pause, loop]);

  return (
    <span className={className} style={style} aria-label={phrases[0]}>
      <style>{CSS}</style>
      <span aria-hidden>{txt}</span>
      <span aria-hidden className="au-tw-c">{cursor}</span>
    </span>
  );
}
