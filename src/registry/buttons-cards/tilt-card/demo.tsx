"use client";

import { TiltCard } from "./tilt-card";

export default function Demo() {
  return (
    <TiltCard style={{ width: 300, padding: 28, background: "linear-gradient(135deg,#1d2b64,#7b4397 60%,#dc2430)", boxShadow: "0 30px 60px -20px rgb(0 0 0/.6)" }}>
      <div style={{ fontSize: 12, letterSpacing: "0.2em", opacity: 0.7 }}>AURELIUS PRO</div>
      <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.03em", marginTop: 56 }}>Tilt me.</div>
      <div style={{ opacity: 0.7, marginTop: 6, fontSize: 14 }}>3D with a moving glare.</div>
    </TiltCard>
  );
}
