"use client";

import { FaqAccordion } from "./faq-accordion";

export default function Demo() {
  return (
    <div style={{ width: "100%", maxWidth: 560 }}>
      <FaqAccordion defaultOpen={0} items={[
        { q: "Is there a free plan?", a: "Yes — the Hobby plan is free forever, no card required." },
        { q: "Can I cancel any time?", a: "Absolutely. Cancel from settings and you won't be charged again." },
        { q: "Do you offer refunds?", a: "Within 14 days of purchase, no questions asked." },
      ]} />
    </div>
  );
}
