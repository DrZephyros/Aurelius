"use client";

import { CtaBanner } from "./cta-banner";

export default function Demo() {
  return <div style={{ width: "100%", maxWidth: 640 }}><CtaBanner title="Ready to ship something great?" description="Start free. Upgrade when you outgrow it." primary={{ label: "Get started", href: "#" }} secondary={{ label: "Talk to sales", href: "#" }} /></div>;
}
