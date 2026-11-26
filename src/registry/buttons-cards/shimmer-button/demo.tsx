"use client";

import { ShimmerButton } from "./shimmer-button";

export default function Demo() {
  return (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
      <ShimmerButton>Start building ✦</ShimmerButton>
      <ShimmerButton glow="#ff7ad9" background="#1a0b18">Upgrade to Pro</ShimmerButton>
    </div>
  );
}
