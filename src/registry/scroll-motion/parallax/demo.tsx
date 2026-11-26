"use client";

import { useEffect, useRef } from "react";

/** Preview: simulates scrolling so the layers visibly move at different speeds. The real component uses the page scroll. */
export default function Demo() {
  const l = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  useEffect(() => {
    let raf = 0;
    const loop = (t: number) => {
      const s = Math.sin(t / 1300) * 90;
      [0.5, 0.2, -0.3].forEach((sp, i) => { if (l[i].current) l[i].current!.style.transform = `translateY(${s * -sp}px)`; });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const box = (c: string, x: string, y: string, s: number): React.CSSProperties => ({ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: 24, background: c, opacity: 0.85 });
  return (
    <div style={{ position: "relative", width: 340, height: 260 }}>
      <div ref={l[0]} style={{ position: "absolute", inset: 0 }}><div style={box("linear-gradient(135deg,#3de7ff,#5cffc4)", "6%", "10%", 120)} /></div>
      <div ref={l[1]} style={{ position: "absolute", inset: 0 }}><div style={box("linear-gradient(135deg,#a58bff,#ff7ad9)", "38%", "28%", 140)} /></div>
      <div ref={l[2]} style={{ position: "absolute", inset: 0 }}><div style={box("linear-gradient(135deg,#ffd28a,#ff7ad9)", "62%", "8%", 90)} /></div>
    </div>
  );
}
