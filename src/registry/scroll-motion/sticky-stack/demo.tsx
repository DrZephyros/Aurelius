"use client";

import { StickyStack } from "./sticky-stack";

/** Preview: three stacked cards in a fixed frame (pinned offsets shown statically). Scroll behaviour needs a real page. */
export default function Demo() {
  const cols = ["linear-gradient(135deg,#0f766e,#14b8a6)", "linear-gradient(135deg,#4338ca,#8b5cf6)", "linear-gradient(135deg,#be185d,#fb7185)"];
  return (
    <div style={{ position: "relative", width: 320, height: 250 }}>
      {cols.map((c, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: i * 26, height: 170, borderRadius: 24, background: c, transform: `scale(${1 - (2 - i) * 0.04})`, transformOrigin: "50% 0", padding: 22, fontSize: 22, fontWeight: 600, boxShadow: "0 -14px 30px -12px rgb(0 0 0/.5)" }}>Step 0{i + 1}</div>
      ))}
      <div style={{ display: "none" }}><StickyStack cards={[]} /></div>
    </div>
  );
}
