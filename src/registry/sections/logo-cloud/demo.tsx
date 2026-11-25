"use client";

import { LogoCloud } from "./logo-cloud";

export default function Demo() {
  return <div style={{ width: "100%" }}><LogoCloud logos={["Vercel", "Linear", "Stripe", "Notion", "Figma", "Supabase", "Raycast"].map((name) => ({ name }))} /></div>;
}
