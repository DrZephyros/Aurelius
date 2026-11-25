"use client";

import { FlipCard } from "./flip-card";

const face = (bg: string): React.CSSProperties => ({ width: "100%", height: "100%", display: "grid", placeItems: "center", background: bg, textAlign: "center", padding: 20 });

export default function Demo() {
  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
      <FlipCard front={<div style={face("linear-gradient(135deg,#0f2027,#2c5364)")}><b style={{ fontSize: 20 }}>Hover to flip</b></div>} back={<div style={face("linear-gradient(135deg,#5cffc4,#3de7ff)")}><span style={{ color: "#021510", fontWeight: 600 }}>Surprise! 🎉</span></div>} />
      <FlipCard trigger="click" axis="x" front={<div style={face("linear-gradient(135deg,#2b1055,#7597de)")}><b style={{ fontSize: 20 }}>Click to flip</b></div>} back={<div style={face("linear-gradient(135deg,#ff7ad9,#ffd28a)")}><span style={{ color: "#200", fontWeight: 600 }}>Vertical axis</span></div>} />
    </div>
  );
}
