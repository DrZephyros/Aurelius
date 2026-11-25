---
name: Pricing table
tagline: Three-plan pricing with a monthly/yearly toggle and a highlighted tier
tags: [pricing, saas, conversion]
deps: []
order: 3
---

# Pricing table

Three-plan pricing with a monthly/yearly toggle and a highlighted tier.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `pricing-table.tsx` | the component — exports `PricingTable` |
| `README.md` | these instructions |

## Install

1. Copy `pricing-table.tsx` into the user's project, e.g. `components/aurelius/pricing-table.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { PricingTable } from "@/components/aurelius/pricing-table";

<PricingTable plans={[
  { name: "Free", monthly: 0, features: ["1 project"], cta: { label: "Start", href: "/signup" } },
  { name: "Pro", monthly: 29, yearly: 23, highlighted: true, features: ["Unlimited"], cta: { label: "Upgrade", href: "/checkout?plan=pro" } },
]} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `plans` | `Plan[]` | — | `{ name, description?, monthly: number\|null, yearly?: number\|null, features: string[], cta: {label, href}, highlighted? }` |
| `currency` | `string` | `"$"` | Currency symbol |
| `yearlyBadge` | `string` | `"Save 20%"` | Text on the yearly toggle |

## Notes for the agent

- `yearly` is the effective per-month price when billed yearly.
- `monthly: null` shows "Custom" (enterprise).
- Wire `cta.href` to your checkout (Stripe Payment Link or your own route).
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
