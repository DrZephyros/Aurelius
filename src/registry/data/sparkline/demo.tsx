"use client";

import { Sparkline } from "./sparkline";

export default function Demo() {
  return (
    <div style={{ display: "flex", gap: 30, flexWrap: "wrap", justifyContent: "center" }}>
      <Sparkline data={[4, 7, 5, 9, 8, 14, 12, 18, 16, 24]} width={200} height={70} />
      <Sparkline data={[20, 18, 22, 15, 17, 11, 13, 8, 9, 5]} width={200} height={70} color="#ff7ad9" />
    </div>
  );
}
