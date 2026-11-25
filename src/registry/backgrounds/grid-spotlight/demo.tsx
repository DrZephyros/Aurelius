"use client";

import { GridSpotlight } from "./grid-spotlight";

export default function Demo() {
  return (
    <GridSpotlight style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center", fontSize: "clamp(1.8rem,5vw,3rem)", fontWeight: 600, letterSpacing: "-0.04em" }}>Light up the grid.</div>
    </GridSpotlight>
  );
}
