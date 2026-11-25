"use client";

import { GlitchText } from "./glitch-text";

export default function Demo() {
  return (
    <div className="text-center" style={{ fontSize: "clamp(2.4rem,7vw,4.4rem)", fontWeight: 700, letterSpacing: "-0.04em" }}>
      <GlitchText text="SYSTEM FAILURE" active="always" />
      <div style={{ fontSize: 18, marginTop: 14, fontWeight: 500 }}><GlitchText text="hover for the glitch" style={{ cursor: "default" }} /></div>
    </div>
  );
}
