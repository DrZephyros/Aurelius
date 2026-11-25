---
name: Stats band
tagline: A bordered row of big numbers that count up on scroll
tags: [stats, social-proof, landing, kpi]
deps: []
order: 7
---

# Stats band

A bordered row of big numbers that count up on scroll.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `stats-band.tsx` | the component — exports `StatsBand` |
| `README.md` | these instructions |

## Install

1. Copy `stats-band.tsx` into the user's project, e.g. `components/aurelius/stats-band.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { StatsBand } from "@/components/aurelius/stats-band";

<StatsBand stats={[{ value: 50000, suffix: "+", label: "Users" }, { value: 4.9, decimals: 1, label: "Rating" }]} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `stats` | `{ value: number; label: string; prefix?: string; suffix?: string; decimals?: number }[]` | — | The figures |

## Notes for the agent

- Self-contained (the count-up logic is inline) — no need to also copy `count-up`.
- Stacks vertically on phones.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
