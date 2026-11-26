---
name: Bento grid
tagline: An asymmetric feature grid with cursor-lit tiles
tags: [features, landing, grid, apple-style]
deps: []
order: 2
---

# Bento grid

An asymmetric feature grid with cursor-lit tiles.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `bento-grid.tsx` | the component — exports `BentoGrid` |
| `README.md` | these instructions |

## Install

1. Copy `bento-grid.tsx` into the user's project, e.g. `components/aurelius/bento-grid.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { BentoGrid } from "@/components/aurelius/bento-grid";

<BentoGrid items={[
  { title: "Analytics", description: "…", icon: <ChartIcon />, size: "lg" },
  { title: "Teams", icon: <UsersIcon /> },
  { title: "API", size: "wide" },
]} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `BentoItem[]` | — | `{ title, description?, icon?, visual?, size?: "sm"\|"wide"\|"tall"\|"lg", href? }` |
| `className / style` | `string / CSSProperties` | — | Override gap, row height (`gridAutoRows`)… |

## Notes for the agent

- 4 columns on desktop, 2 on tablet, 1 on phones; `grid-auto-flow: dense` fills gaps.
- Sizes: sm 1×1 · wide 2×1 · tall 1×2 · lg 2×2. A balanced set is e.g. lg + sm + sm + wide.
- `visual` is positioned in the top 60% of the tile; pass an illustration, gradient or mini UI.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
