"use client";

import { FloatingDock } from "./floating-dock";

export default function Demo() {
  const e = (c: string) => <span style={{ fontSize: 20 }}>{c}</span>;
  return <FloatingDock items={[{ label: "Home", icon: e("🏠"), href: "#" }, { label: "Search", icon: e("🔎"), href: "#" }, { label: "Messages", icon: e("💬"), href: "#" }, { label: "Music", icon: e("🎧"), href: "#" }, { label: "Photos", icon: e("🖼️"), href: "#" }, { label: "Settings", icon: e("⚙️"), href: "#" }]} />;
}
