"use client";

import { useState } from "react";
import { ScrambleText } from "./scramble-text";

export default function Demo() {
  const [n, setN] = useState(0);
  return (
    <div className="text-center">
      <ScrambleText key={n} as="h2" trigger="mount" text="Decode the signal." style={{ fontSize: "clamp(2rem,6vw,3.6rem)", fontWeight: 600, letterSpacing: "-0.04em" }} />
      <div style={{ marginTop: 18 }}>
        <ScrambleText trigger="hover" text="Hover me — scramble again" style={{ fontFamily: "monospace", fontSize: 13, opacity: 0.7, cursor: "default" }} />
      </div>
      <button onClick={() => setN(n + 1)} style={{ marginTop: 22, fontSize: 12, opacity: 0.6, textDecoration: "underline" }}>replay</button>
    </div>
  );
}
