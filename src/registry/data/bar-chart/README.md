---
name: Bar chart
tagline: An animated bar chart with hover values, no chart library needed
tags: [chart, dashboard, analytics]
deps: []
order: 2
---

# Bar chart

An animated bar chart with hover values, no chart library needed.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `bar-chart.tsx` | the component — exports `BarChart` |
| `README.md` | these instructions |

## Install

1. Copy `bar-chart.tsx` into the user's project, e.g. `components/aurelius/bar-chart.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { BarChart } from "@/components/aurelius/bar-chart";

<BarChart data={[{ label: "Jan", value: 120 }, { label: "Feb", value: 180 }]} format={(v) => `$${v}`} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `{ label: string; value: number }[]` | — | Bars |
| `height` | `number` | `220` | Chart height (px) |
| `color` | `string` | `"#5cffc4"` | Bar colour |
| `format` | `(v: number) => string` | `toLocaleString` | Hover label formatter |

## Notes for the agent

- Good for ≤ 12 bars. For complex charts (axes, tooltips, multiple series) use Recharts or visx instead.
- Has an `aria-label` summarising the data for screen readers.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
