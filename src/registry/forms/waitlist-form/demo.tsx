"use client";

import { WaitlistForm } from "./waitlist-form";

/** Preview endpoint is stubbed with a fake fetch so the demo works without a backend. */
export default function Demo() {
  const fake = typeof window !== "undefined" ? "/__demo-waitlist" : "";
  if (typeof window !== "undefined" && !(window as unknown as { __auWl?: boolean }).__auWl) {
    (window as unknown as { __auWl?: boolean }).__auWl = true;
    const orig = window.fetch;
    window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).includes("__demo-waitlist")) { await new Promise((r) => setTimeout(r, 900)); return new Response("{}", { status: 200 }); }
      return orig(input, init);
    }) as typeof window.fetch;
  }
  return <div style={{ width: "100%", maxWidth: 440 }}><WaitlistForm endpoint={fake} /></div>;
}
