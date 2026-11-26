"use client";

import { MagneticButton } from "./magnetic-button";

export default function Demo() {
  return (
    <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center", padding: 24 }}>
      <MagneticButton>Get started →</MagneticButton>
      <MagneticButton strength={0.55} style={{ background: "transparent", color: "inherit", border: "1px solid rgb(255 255 255 / .3)" }}>Strong pull</MagneticButton>
    </div>
  );
}
