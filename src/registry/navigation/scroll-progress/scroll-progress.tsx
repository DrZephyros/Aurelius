"use client";

import { useEffect, useRef } from "react";

export type ScrollProgressProps = {
  /** Gradient or solid CSS colour. */
  color?: string;
  height?: number;
  position?: "top" | "bottom";
  zIndex?: number;
};

/** A slim bar fixed to the viewport edge that fills as the page scrolls. Updates via transform (no re-renders). */
export function ScrollProgress({ color = "linear-gradient(90deg,#5cffc4,#3de7ff,#a58bff)", height = 3, position = "top", zIndex = 60 }: ScrollProgressProps) {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - innerHeight;
        bar.current!.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
      });
    };
    on();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", on); removeEventListener("resize", on); };
  }, []);
  return (
    <div aria-hidden style={{ position: "fixed", left: 0, right: 0, [position]: 0, height, zIndex, pointerEvents: "none" }}>
      <div ref={bar} style={{ height: "100%", background: color, transformOrigin: "0 50%", transform: "scaleX(0)" }} />
    </div>
  );
}
