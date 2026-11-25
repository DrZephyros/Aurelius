"use client";

import { useState } from "react";
import { Reveal } from "./reveal";

export default function Demo() {
  const [n, setN] = useState(0);
  const v = ["up", "left", "scale", "blur", "right"] as const;
  return (
    <div className="text-center">
      <div key={n} style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {v.map((x, i) => <Reveal key={x} variant={x} delay={i * 120} style={{ padding: "20px 22px", borderRadius: 16, border: "1px solid rgb(255 255 255/.12)", background: "rgb(255 255 255/.04)", fontSize: 14 }}>{x}</Reveal>)}
      </div>
      <button onClick={() => setN(n + 1)} style={{ marginTop: 22, fontSize: 12, opacity: 0.6, textDecoration: "underline" }}>replay</button>
    </div>
  );
}
