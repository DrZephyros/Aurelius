"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ElementType } from "react";

export type ScrambleTextProps = {
  /** The final text that the effect resolves to. Changing it re-runs the effect. */
  text: string;
  /** Element to render. Default "span". */
  as?: ElementType;
  /** "view" runs every time it scrolls into view, "hover" on pointer enter / focus, "mount" immediately. */
  trigger?: "view" | "hover" | "mount";
  /** Only play the first time it comes into view (trigger="view"). Default false — it replays on every entry. */
  once?: boolean;
  /** Replay every N ms while visible (0 = off). */
  interval?: number;
  /** Total duration in ms. */
  duration?: number;
  /** Characters used for the noise. */
  chars?: string;
  className?: string;
  style?: CSSProperties;
};

/** Decodes text from random characters, left to right. Great for headings, stats and hover labels. */
export function ScrambleText({ text, as, trigger = "view", once = false, interval = 0, duration = 1000, chars = "!<>-_\\/[]{}—=+*^?#0123456789", className, style }: ScrambleTextProps) {
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
    if (trigger === "mount") {
      run();
      return;
    }
    if (trigger !== "view" || !ref.current) return;
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      window.clearInterval(timer);
      if (e.isIntersecting) {
        run(); // every entry replays — the observer is never thrown away
        if (once) io.disconnect();
        else if (interval > 0) timer = window.setInterval(run, interval);
      } else {
        cancelAnimationFrame(raf.current);
        setOut(text); // leave it readable
      }
    }, { threshold: 0.6 });
    io.observe(ref.current);
    return () => { io.disconnect(); window.clearInterval(timer); };
  }, [trigger, run, once, interval, text]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <Tag
      ref={ref}
      className={className}
      style={{ fontVariantNumeric: "tabular-nums", ...style }}
      aria-label={text}
      tabIndex={trigger === "hover" ? 0 : undefined}
      onPointerEnter={trigger === "hover" ? run : undefined}
      onFocus={trigger === "hover" ? run : undefined}
    >
      <span aria-hidden>{out}</span>
    </Tag>
  );
}
