"use client";

import { PricingTable } from "./pricing-table";

export default function Demo() {
  return (
    <div style={{ width: "100%", maxWidth: 820, transform: "scale(.9)", transformOrigin: "top center" }}>
      <PricingTable
        plans={[
          { name: "Hobby", description: "For side projects", monthly: 0, yearly: 0, features: ["1 project", "Community support"], cta: { label: "Start free", href: "#" } },
          { name: "Pro", description: "For shipping teams", monthly: 29, yearly: 23, features: ["Unlimited projects", "Priority support", "Custom domains"], cta: { label: "Go Pro", href: "#" }, highlighted: true },
          { name: "Scale", description: "For companies", monthly: null, features: ["SSO + audit logs", "SLA"], cta: { label: "Talk to us", href: "#" } },
        ]}
      />
    </div>
  );
}
