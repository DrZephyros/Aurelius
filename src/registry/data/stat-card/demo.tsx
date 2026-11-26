"use client";

import { StatCard } from "./stat-card";

export default function Demo() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14, width: "100%", maxWidth: 560 }}>
      <StatCard label="Revenue" prefix="$" value={48230} delta={12.4} trend={[3, 5, 4, 7, 6, 9, 12]} />
      <StatCard label="Churn" suffix="%" decimals={1} value={2.4} delta={-0.6} trend={[9, 8, 8, 6, 5, 4, 3]} />
    </div>
  );
}
