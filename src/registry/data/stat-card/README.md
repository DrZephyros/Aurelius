---
name: Stat card
tagline: A KPI tile with a rolling number, delta badge and mini trend line
tags: [kpi, dashboard, analytics]
deps: []
order: 4
---

# Stat card

A KPI tile with a rolling number, delta badge and mini trend line.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `stat-card.tsx` | the component — exports `StatCard` |
| `README.md` | these instructions |

## Install

1. Copy `stat-card.tsx` into the user's project, e.g. `components/aurelius/stat-card.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { StatCard } from "@/components/aurelius/stat-card";

<StatCard label="MRR" prefix="$" value={12840} delta={8.2} trend={[4,6,5,8,9,12]} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | — | Metric name |
| `value` | `number` | — | Current value |
| `prefix / suffix` | `string` | `""` | Units |
| `decimals` | `number` | `0` | Fraction digits |
| `delta` | `number` | — | % change vs previous period (sign sets colour) |
| `trend` | `number[]` | — | Optional mini line |

## Notes for the agent

- Self-contained — it doesn't need the Sparkline component.
- Pass `delta` positive for good, negative for bad; invert yourself for metrics where lower is better (e.g. churn: pass the negative of the change).
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
