"use client";

import { useState } from "react";
import { HighlightText } from "./highlight-text";

export default function Demo() {
  const [n, setN] = useState(0);
  return (
    <div key={n} className="text-center" style={{ fontSize: "clamp(1.4rem,3.6vw,2.4rem)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.5 }}>
      Make the <HighlightText>important part</HighlightText> impossible to miss,<br />
      <HighlightText variant="underline" color="#ffd28a" delay={600}>underline the promise</HighlightText> and{" "}
      <HighlightText variant="strike" color="#ff7ad9" delay={1100}>cross out the old price</HighlightText>.
      <div><button onClick={() => setN(n + 1)} style={{ marginTop: 18, fontSize: 12, opacity: 0.6, textDecoration: "underline", fontWeight: 400 }}>replay</button></div>
    </div>
  );
}
