"use client";

import { SmartNavbar } from "./smart-navbar";

export default function Demo() {
  /* the real component is position:fixed; here it is pinned inside the preview frame */
  return (
    <div style={{ position: "absolute", inset: 0, transform: "translateZ(0)", overflow: "hidden" }}>
      <SmartNavbar style={{ position: "absolute" }} logo="◆ Acme" links={[{ label: "Product", href: "#" }, { label: "Pricing", href: "#" }, { label: "Docs", href: "#" }]} cta={{ label: "Get started", href: "#" }} />
      <div style={{ paddingTop: 120, textAlign: "center", opacity: 0.6, fontSize: 14 }}>Scroll the page: it hides on the way down and returns on the way up.</div>
    </div>
  );
}
