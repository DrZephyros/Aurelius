"use client";

import { useEffect, useRef } from "react";

/** Preview: a miniature, auto-playing version of the pinned track. The real component is driven by the page scroll. */
export default function Demo() {
  const t = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = (ms: number) => { if (t.current) t.current.style.transform = `translateX(${-((Math.sin(ms / 1800) + 1) / 2) * 560}px)`; raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const cols = ["#3de7ff", "#a58bff", "#ff7ad9", "#ffd28a", "#5cffc4"];
  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <div ref={t} style={{ display: "flex", gap: 16, width: "max-content", padding: "0 24px" }}>
        {cols.map((c, i) => <div key={c} style={{ width: 240, height: 170, borderRadius: 20, background: `linear-gradient(135deg, ${c}, transparent 140%), #0c111d`, padding: 18, fontWeight: 600, fontSize: 26 }}>0{i + 1}</div>)}
      </div>
      <p style={{ textAlign: "center", fontSize: 12, opacity: 0.5, marginTop: 14 }}>simulated · on a real page the track follows your vertical scroll</p>
    </div>
  );
}
