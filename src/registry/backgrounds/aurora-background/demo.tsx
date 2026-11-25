"use client";

import { AuroraBackground } from "./aurora-background";

export default function Demo() {
  return (
    <AuroraBackground style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center", padding: 24 }}>
        <div style={{ fontSize: "clamp(2rem,6vw,3.4rem)", fontWeight: 600, letterSpacing: "-0.04em" }}>Aurora, in one tag.</div>
        <div style={{ opacity: 0.6, marginTop: 8 }}>Wrap any hero or section.</div>
      </div>
    </AuroraBackground>
  );
}
