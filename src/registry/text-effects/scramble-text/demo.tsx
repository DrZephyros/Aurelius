"use client";

import { useEffect, useState } from "react";
import { ScrambleText } from "./scramble-text";

const LINES = ["Decode the signal.", "Resolve the noise.", "Find the pattern.", "Say it in static."];

/** The headline decodes a new line every few seconds, the second line decodes on every hover. */
export default function Demo() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % LINES.length), 3400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-center">
      <ScrambleText as="h2" trigger="view" text={LINES[i]} duration={1300} style={{ display: "block", minWidth: "11ch", fontSize: "clamp(2rem,6vw,3.6rem)", fontWeight: 600, letterSpacing: "-0.04em" }} />
      <div style={{ marginTop: 22 }}>
        <ScrambleText trigger="hover" text="Hover me — it scrambles every time" style={{ fontFamily: "monospace", fontSize: 14, opacity: 0.75, cursor: "default" }} />
      </div>
      <div style={{ marginTop: 10, fontSize: 11, opacity: 0.4, letterSpacing: "0.14em", textTransform: "uppercase" }}>replays on every hover · and every time it scrolls back into view</div>
    </div>
  );
}
