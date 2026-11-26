"use client";

import { useEffect, useRef } from "react";

export type CustomCursorProps = {
  color?: string;
  /** Hide the native cursor everywhere. */
  hideNative?: boolean;
  /** Elements that make the ring grow. */
  hoverSelector?: string;
};

/** A dot + trailing ring cursor that swells over links/buttons. Mount ONCE (e.g. in the root layout). Disabled on touch. */
export function CustomCursor({ color = "#5cffc4", hideNative = true, hoverSelector = "a, button, [role=button], input, textarea, select, label, [data-cursor]" }: CustomCursorProps) {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (matchMedia("(pointer: coarse)").matches) return;
    const d = dot.current!, r = ring.current!;
    let x = -100, y = -100, rx = x, ry = y, scale = 1, target = 1, raf = 0, shown = false;
    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      if (!shown) { shown = true; rx = x; ry = y; d.style.opacity = r.style.opacity = "1"; }
      target = (e.target as Element | null)?.closest?.(hoverSelector) ? 1.9 : 1;
    };
    const out = () => { shown = false; d.style.opacity = r.style.opacity = "0"; };
    const down = () => (target *= 0.7);
    const loop = () => {
      rx += (x - rx) * 0.16; ry += (y - ry) * 0.16; scale += (target - scale) * 0.18;
      d.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${scale > 1.3 ? 0.4 : 1})`;
      r.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%) scale(${scale})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", down);
    document.documentElement.addEventListener("pointerleave", out);
    if (hideNative) document.documentElement.classList.add("au-nocursor");
    return () => { cancelAnimationFrame(raf); removeEventListener("pointermove", move); removeEventListener("pointerdown", down); document.documentElement.removeEventListener("pointerleave", out); document.documentElement.classList.remove("au-nocursor"); };
  }, [hideNative, hoverSelector]);

  const base = { position: "fixed", left: 0, top: 0, pointerEvents: "none", zIndex: 9999, opacity: 0, transition: "opacity .3s" } as const;
  return (
    <>
      <style>{`.au-nocursor,.au-nocursor *{cursor:none!important}@media (pointer:coarse){.au-cur{display:none}}`}</style>
      <div ref={ring} className="au-cur" aria-hidden style={{ ...base, width: 38, height: 38, borderRadius: "50%", border: `1.5px solid ${color}`, mixBlendMode: "difference" }} />
      <div ref={dot} className="au-cur" aria-hidden style={{ ...base, width: 8, height: 8, borderRadius: "50%", background: color }} />
    </>
  );
}
