"use client";

import { RotatingWords } from "./rotating-words";

export default function Demo() {
  return (
    <h2 className="text-center" style={{ fontSize: "clamp(2rem,6vw,3.6rem)", fontWeight: 600, letterSpacing: "-0.04em", lineHeight: 1.15 }}>
      Build your next<br /><RotatingWords words={["landing page", "dashboard", "portfolio", "startup"]} />
    </h2>
  );
}
