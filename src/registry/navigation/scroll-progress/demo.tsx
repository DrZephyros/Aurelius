"use client";

import { useEffect, useRef } from "react";

/** Preview: the real ScrollProgress listens to the page scroll, so here we mirror it with an auto-playing bar. */
export default function Demo() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = (t: number) => { if (ref.current) ref.current.style.transform = `scaleX(${(Math.sin(t / 1400) + 1) / 2})`; raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div style={{ width: "100%", maxWidth: 520 }}>
      <div style={{ height: 3, overflow: "hidden", borderRadius: 3, background: "rgb(255 255 255/.08)" }}>
        <div ref={ref} style={{ height: "100%", background: "linear-gradient(90deg,#5cffc4,#3de7ff,#a58bff)", transformOrigin: "0 50%" }} />
      </div>
      <p style={{ textAlign: "center", opacity: 0.55, fontSize: 13, marginTop: 14 }}>On your page this bar is fixed to the top and follows the real scroll position.</p>
    </div>
  );
}
