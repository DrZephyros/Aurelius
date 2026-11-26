"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

export type ScrollToTopProps = {
  /** Show after scrolling this many px. */
  threshold?: number;
  size?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
};

/** Floating "back to top" button with a progress ring that fills as you scroll. */
export function ScrollToTop({ threshold = 480, size = 52, color = "#5cffc4", className, style }: ScrollToTopProps) {
  const [show, setShow] = useState(false);
  const ring = useRef<SVGCircleElement>(null);
  const r = size / 2 - 3, c = 2 * Math.PI * r;
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      setShow(scrollY > threshold);
      if (ring.current) ring.current.style.strokeDashoffset = String(c * (1 - (h > 0 ? Math.min(1, scrollY / h) : 0)));
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, [threshold, c]);
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => scrollTo({ top: 0, behavior: "smooth" })}
      className={className}
      style={{ position: "fixed", right: 20, bottom: 20, zIndex: 900, width: size, height: size, borderRadius: "50%", display: "grid", placeItems: "center", cursor: "pointer", color: "inherit", background: "rgb(12 17 29/.85)", backdropFilter: "blur(10px)", border: "1px solid rgb(255 255 255/.12)", opacity: show ? 1 : 0, transform: show ? "none" : "translateY(16px) scale(.8)", pointerEvents: show ? "auto" : "none", transition: "opacity .4s, transform .5s cubic-bezier(.16,1,.3,1)", ...style }}
    >
      <svg width={size} height={size} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }} aria-hidden>
        <circle ref={ring} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c} />
      </svg>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 19V5M5 12l7-7 7 7" /></svg>
    </button>
  );
}
