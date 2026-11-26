"use client";

import { SpotlightCard } from "./spotlight-card";

export default function Demo() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, width: "100%", maxWidth: 680 }}>
      {[["Instant", "Zero config, drop in and go.", "#5cffc4"], ["Typed", "Full TypeScript props.", "#a58bff"], ["Tiny", "One file, no deps.", "#ff7ad9"]].map(([t, d, c]) => (
        <SpotlightCard key={t} color={c}>
          <div style={{ fontWeight: 600, fontSize: 18 }}>{t}</div>
          <div style={{ opacity: 0.6, marginTop: 6, fontSize: 14 }}>{d}</div>
        </SpotlightCard>
      ))}
    </div>
  );
}
