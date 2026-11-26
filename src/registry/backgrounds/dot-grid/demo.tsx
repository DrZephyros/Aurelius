"use client";

import { DotGrid } from "./dot-grid";

export default function Demo() {
  return (
    <DotGrid style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none", height: 400 }} />
    </DotGrid>
  );
}
