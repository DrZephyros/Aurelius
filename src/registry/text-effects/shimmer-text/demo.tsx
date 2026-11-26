"use client";

import { ShimmerText } from "./shimmer-text";

export default function Demo() {
  return (
    <div className="text-center" style={{ fontSize: "clamp(2rem,6vw,3.6rem)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.05 }}>
      <ShimmerText as="div">Thinking about it…</ShimmerText>
      <ShimmerText as="div" mode="flow">Vibecode the next dimension</ShimmerText>
    </div>
  );
}
