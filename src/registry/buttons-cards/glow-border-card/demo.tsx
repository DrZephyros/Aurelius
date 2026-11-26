"use client";

import { GlowBorderCard } from "./glow-border-card";

export default function Demo() {
  return (
    <GlowBorderCard style={{ width: 300 }}>
      <div style={{ fontSize: 12, letterSpacing: "0.18em", opacity: 0.55 }}>MOST POPULAR</div>
      <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.04em", marginTop: 10 }}>$29<span style={{ fontSize: 14, opacity: 0.5 }}> / mo</span></div>
      <div style={{ opacity: 0.65, marginTop: 6, fontSize: 14 }}>Everything you need to launch.</div>
    </GlowBorderCard>
  );
}
