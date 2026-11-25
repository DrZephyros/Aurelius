---
name: Tilt card
tagline: A 3D card that tips toward the pointer with a specular glare
tags: [card, 3d, hover, pricing]
deps: []
order: 4
---

# Tilt card

A 3D card that tips toward the pointer with a specular glare.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `tilt-card.tsx` | the component — exports `TiltCard` |
| `README.md` | these instructions |

## Install

1. Copy `tilt-card.tsx` into the user's project, e.g. `components/aurelius/tilt-card.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { TiltCard } from "@/components/aurelius/tilt-card";

<TiltCard className="w-80 h-48 bg-slate-800 p-6">
  <h3>Pro plan</h3>
</TiltCard>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Card content |
| `max` | `number` | `12` | Max rotation (deg) |
| `scale` | `number` | `1.03` | Hover scale |
| `glare` | `boolean` | `true` | Moving highlight |
| `className / style` | `string / CSSProperties` | — | Give it a size + background |

## Notes for the agent

- The card has no default background — provide one (class or style).
- Touch devices skip tilt (no hover).
- Don't nest TiltCards.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
