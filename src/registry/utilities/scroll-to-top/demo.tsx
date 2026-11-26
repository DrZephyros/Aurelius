"use client";

import { useEffect, useRef } from "react";

/** Preview: static render of the button with an auto-playing ring (the real one is fixed to the viewport). */
export default function Demo() {
  const ring = useRef<SVGCircleElement>(null);
  const size = 56, r = size / 2 - 3, c = 2 * Math.PI * r;
  useEffect(() => {
    let raf = 0;
    const loop = (t: number) => { if (ring.current) ring.current.style.strokeDashoffset = String(c * (1 - (Math.sin(t / 1200) + 1) / 2)); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [c]);
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: "50%", display: "grid", placeItems: "center", background: "rgb(12 17 29/.85)", border: "1px solid rgb(255 255 255/.12)" }}>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}><circle ref={ring} cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#5cffc4" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={c} /></svg>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
    </div>
  );
}
