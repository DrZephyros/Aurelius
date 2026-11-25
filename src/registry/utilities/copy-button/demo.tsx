"use client";

import { CopyButton } from "./copy-button";

export default function Demo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 10px 10px 18px", borderRadius: 16, border: "1px solid rgb(255 255 255/.14)", background: "rgb(255 255 255/.04)", fontFamily: "ui-monospace,monospace", fontSize: 14 }}>
      npx create-aurelius-app
      <CopyButton text="npx create-aurelius-app" />
    </div>
  );
}
