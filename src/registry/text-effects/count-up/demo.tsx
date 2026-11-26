"use client";

import { useState } from "react";
import { CountUp } from "./count-up";

export default function Demo() {
  const [n, setN] = useState(0);
  return (
    <div className="text-center">
      <div key={n} style={{ display: "flex", gap: 48, justifyContent: "center", flexWrap: "wrap" }}>
        {([[48200, "+", "", "Developers"], [99.98, "%", "", "Uptime"], [3.4, "M", "$", "Revenue"]] as const).map(([to, suf, pre, l]) => (
          <div key={l}>
            <div style={{ fontSize: "clamp(2.2rem,6vw,3.6rem)", fontWeight: 600, letterSpacing: "-0.04em" }}>
              <CountUp to={to} suffix={suf} prefix={pre} decimals={to % 1 ? 2 : 0} />
            </div>
            <div style={{ fontSize: 12, opacity: 0.55, letterSpacing: "0.14em", textTransform: "uppercase" }}>{l}</div>
          </div>
        ))}
      </div>
      <button onClick={() => setN(n + 1)} style={{ marginTop: 22, fontSize: 12, opacity: 0.6, textDecoration: "underline" }}>replay</button>
    </div>
  );
}
