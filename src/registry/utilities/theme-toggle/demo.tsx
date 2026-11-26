"use client";

import { ThemeToggle } from "./theme-toggle";

/** Preview: uses a private storage key and attribute mode so it doesn't change this site's theme. */
export default function Demo() {
  return (
    <div className="text-center">
      <ThemeToggle size={56} mode="attribute" storageKey="au-demo-theme" />
      <div style={{ fontSize: 12, opacity: 0.5, marginTop: 12 }}>Click to flip (demo only toggles its own icon)</div>
    </div>
  );
}
