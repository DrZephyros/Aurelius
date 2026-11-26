"use client";

import { Meteors } from "./meteors";

export default function Demo() {
  return (
    <Meteors count={18} style={{ position: "absolute", inset: 0, background: "radial-gradient(80% 70% at 50% 100%, #12183a, #04060c)" }}>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", height: 400, fontSize: "clamp(1.6rem,5vw,2.8rem)", fontWeight: 600, letterSpacing: "-0.04em" }}>Make a wish.</div>
    </Meteors>
  );
}
