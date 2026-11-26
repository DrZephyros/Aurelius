"use client";

import { CookieBanner } from "./cookie-banner";

/** Preview: uses a throw-away storage key and re-opens on reload, pinned inside the frame. */
export default function Demo() {
  return (
    <div style={{ position: "absolute", inset: 0, transform: "translateZ(0)", overflow: "hidden" }}>
      <CookieBanner storageKey={"au-demo-" + Math.random()} style={{ position: "absolute" }} />
    </div>
  );
}
