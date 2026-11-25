"use client";

import { HeroCentered } from "./hero-centered";

export default function Demo() {
  return (
    <HeroCentered
      style={{ position: "absolute", inset: 0, padding: "56px 20px 20px" }}
      badge={<><span style={{ color: "#5cffc4" }}>●</span> v2.0 is live</>}
      title={<>Ship the thing, <span style={{ color: "#5cffc4" }}>today.</span></>}
      subtitle="A complete hero section in one component."
      primary={{ label: "Get started", href: "#" }}
      secondary={{ label: "Live demo", href: "#" }}
    />
  );
}
