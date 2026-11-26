"use client";

import { RadialProgress } from "./radial-progress";

export default function Demo() {
  return (
    <div style={{ display: "flex", gap: 30, flexWrap: "wrap", justifyContent: "center" }}>
      <RadialProgress value={82} />
      <RadialProgress value={46} colors={["#ffd28a", "#ff7ad9"]} size={120}><span style={{ fontSize: 16 }}>46 / 100</span></RadialProgress>
    </div>
  );
}
