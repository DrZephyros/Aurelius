"use client";

import { GradientMesh } from "./gradient-mesh";

export default function Demo() {
  return (
    <GradientMesh style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center", mixBlendMode: "difference" }}>
        <div style={{ fontSize: "clamp(2rem,6vw,3.4rem)", fontWeight: 600, letterSpacing: "-0.04em" }}>Move your cursor.</div>
        <div style={{ opacity: 0.7, marginTop: 8 }}>The colours follow.</div>
      </div>
    </GradientMesh>
  );
}
