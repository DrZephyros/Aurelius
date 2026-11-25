"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollLitText } from "./scroll-lit-text";

/** In this preview the text is driven by a slider so you can see it without scrolling the page. */
export default function Demo() {
  const [k, setK] = useState(0.55);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current?.querySelector("p") as HTMLElement | null;
    if (!el) return;
    const spans = [...el.querySelectorAll<HTMLElement>("[data-w]")];
    const apply = () => spans.forEach((s, i) => { const lit = Math.min(1, Math.max(0, k * 1.25 * spans.length - i) / 1.5); s.style.opacity = String(0.16 + 0.84 * lit); });
    apply();
    const t = setInterval(apply, 60);
    return () => clearInterval(t);
  }, [k]);
  return (
    <div ref={ref} style={{ maxWidth: 640 }}>
      <ScrollLitText text="Great motion is *felt,* not noticed. Words ignite as you read, so the *story* moves at the speed of the reader." style={{ fontSize: "clamp(1.4rem,3.4vw,2.2rem)", fontWeight: 600, lineHeight: 1.15, letterSpacing: "-0.03em" }} />
      <input type="range" min={0} max={1} step={0.01} value={k} onChange={(e) => setK(+e.target.value)} style={{ width: "100%", marginTop: 24 }} aria-label="Scroll progress" />
      <div style={{ fontSize: 11, opacity: 0.5, textAlign: "center", marginTop: 4 }}>preview slider — on a real page this is your scroll position</div>
    </div>
  );
}
