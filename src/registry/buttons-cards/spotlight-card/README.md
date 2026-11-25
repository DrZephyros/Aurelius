---
name: Spotlight card
tagline: A card lit by a soft spotlight and glowing border that follow the cursor
tags: [card, hover, features, pointer]
deps: []
order: 3
---

# Spotlight card

A card lit by a soft spotlight and glowing border that follow the cursor.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `spotlight-card.tsx` | the component — exports `SpotlightCard` |
| `README.md` | these instructions |

## Install

1. Copy `spotlight-card.tsx` into the user's project, e.g. `components/aurelius/spotlight-card.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { SpotlightCard } from "@/components/aurelius/spotlight-card";

<SpotlightCard color="#a58bff" className="max-w-sm">
  <h3>Fast</h3><p>Ships in minutes.</p>
</SpotlightCard>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Card content |
| `color` | `string` | `"#5cffc4"` | Spotlight colour |
| `radius` | `number` | `280` | Spotlight radius (px) |
| `className / style` | `string / CSSProperties` | — | Size, padding, radius overrides |

## Notes for the agent

- Uses `color-mix()` — supported in all current browsers.
- Put several in a CSS grid for a feature section.
- Updates only two CSS variables per pointer move: no React re-renders.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
