"use client";

import { useState, type CSSProperties } from "react";

export type Plan = {
  name: string;
  description?: string;
  /** Price per month when billed monthly. Use `null` for "Custom". */
  monthly: number | null;
  /** Price per month when billed yearly. */
  yearly?: number | null;
  features: string[];
  cta: { label: string; href: string };
  highlighted?: boolean;
};

export type PricingTableProps = { plans: Plan[]; currency?: string; yearlyBadge?: string; className?: string; style?: CSSProperties };

const CSS = `.au-pt-sw{display:inline-flex;gap:4px;padding:4px;border-radius:999px;border:1px solid var(--au-border,rgb(255 255 255/.14));background:rgb(255 255 255/.04)}
.au-pt-sw button{padding:8px 18px;border-radius:999px;font-size:14px;cursor:pointer;opacity:.65;transition:all .3s}.au-pt-sw button[aria-pressed=true]{background:var(--au-accent,#5cffc4);color:var(--au-bg,#021510);opacity:1;font-weight:600}
.au-pt-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;margin-top:32px;align-items:stretch}
.au-pt-c{position:relative;display:flex;flex-direction:column;padding:28px;border-radius:24px;border:1px solid var(--au-border,rgb(255 255 255/.12));background:rgb(255 255 255/.03)}
.au-pt-c.au-hi{border-color:var(--au-accent,#5cffc4);background:linear-gradient(180deg,color-mix(in srgb,var(--au-accent,#5cffc4) 10%,transparent),rgb(255 255 255/.02));box-shadow:0 20px 70px -30px var(--au-accent,#5cffc4)}
.au-pt-p{font-size:46px;font-weight:650;letter-spacing:-.05em;margin:14px 0 2px;font-variant-numeric:tabular-nums}.au-pt-p small{font-size:14px;font-weight:400;opacity:.5;letter-spacing:0}
.au-pt-c ul{list-style:none;padding:0;margin:22px 0 28px;display:grid;gap:10px;font-size:14px;flex:1}.au-pt-c li::before{content:"✓";margin-right:10px;color:var(--au-accent,#5cffc4)}
.au-pt-c a{text-align:center;padding:13px;border-radius:999px;font-weight:600;text-decoration:none;border:1px solid rgb(255 255 255/.22);color:inherit;transition:transform .3s}.au-pt-c a:hover{transform:translateY(-2px)}
.au-hi a{background:var(--au-accent,#5cffc4);border-color:transparent;color:var(--au-bg,#021510)}
.au-pt-tag{position:absolute;top:-12px;left:28px;padding:3px 12px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;background:var(--au-accent,#5cffc4);color:var(--au-bg,#021510)}`;

/** Monthly / yearly toggle with rolling prices and a highlighted plan. */
export function PricingTable({ plans, currency = "$", yearlyBadge = "Save 20%", className, style }: PricingTableProps) {
  const [yearly, setYearly] = useState(true);
  return (
    <div className={className} style={{ textAlign: "center", ...style }}>
      <style>{CSS}</style>
      <div className="au-pt-sw" role="group" aria-label="Billing period">
        <button aria-pressed={!yearly} onClick={() => setYearly(false)}>Monthly</button>
        <button aria-pressed={yearly} onClick={() => setYearly(true)}>Yearly <span style={{ fontSize: 11, opacity: 0.8 }}>{yearlyBadge}</span></button>
      </div>
      <div className="au-pt-g">
        {plans.map((p) => {
          const price = yearly && p.yearly !== undefined ? p.yearly : p.monthly;
          return (
            <div key={p.name} className={`au-pt-c ${p.highlighted ? "au-hi" : ""}`} style={{ textAlign: "left" }}>
              {p.highlighted && <span className="au-pt-tag">Most popular</span>}
              <div style={{ fontWeight: 600, fontSize: 18 }}>{p.name}</div>
              {p.description && <div style={{ fontSize: 14, opacity: 0.6, marginTop: 4 }}>{p.description}</div>}
              <div className="au-pt-p">{price === null ? "Custom" : <>{currency}{price}<small> /mo</small></>}</div>
              <div style={{ fontSize: 12, opacity: 0.45, minHeight: 16 }}>{price !== null && yearly && p.yearly !== undefined ? "billed yearly" : ""}</div>
              <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
              <a href={p.cta.href}>{p.cta.label}</a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
