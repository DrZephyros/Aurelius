"use client";

import { Typewriter } from "./typewriter";

export default function Demo() {
  return (
    <div className="text-center" style={{ fontFamily: "ui-monospace, monospace", fontSize: "clamp(1.1rem,3vw,1.8rem)" }}>
      <span style={{ opacity: 0.5 }}>$ </span>
      <Typewriter phrases={["npx create-next-app", "npm run dev", "ship it on friday"]} style={{ color: "#5cffc4" }} />
    </div>
  );
}
