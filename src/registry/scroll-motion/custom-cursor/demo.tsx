"use client";

import { CustomCursor } from "./custom-cursor";

export default function Demo() {
  return (
    <div className="text-center">
      <CustomCursor />
      <div style={{ fontSize: "clamp(1.6rem,5vw,2.6rem)", fontWeight: 600, letterSpacing: "-0.04em" }}>Your cursor is now the show.</div>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
        <button style={{ padding: "10px 22px", borderRadius: 999, border: "1px solid rgb(255 255 255/.25)" }}>Hover me</button>
        <a href="#" onClick={(e) => e.preventDefault()} style={{ padding: "10px 22px" }}>or me</a>
      </div>
      <div style={{ fontSize: 12, opacity: 0.5, marginTop: 14 }}>(active while this preview is mounted — it's global by design)</div>
    </div>
  );
}
