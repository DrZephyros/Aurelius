---
name: Flip card
tagline: A two-sided card with a smooth 3D flip on hover or click
tags: [card, 3d, team, reveal]
deps: []
order: 6
---

# Flip card

A two-sided card with a smooth 3D flip on hover or click.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `flip-card.tsx` | the component — exports `FlipCard` |
| `README.md` | these instructions |

## Install

1. Copy `flip-card.tsx` into the user's project, e.g. `components/aurelius/flip-card.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { FlipCard } from "@/components/aurelius/flip-card";

<FlipCard
  style={{ width: 320, height: 200 }}
  front={<div className="p-6">Front</div>}
  back={<div className="p-6">Back</div>}
/>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `front` | `ReactNode` | — | Front face content |
| `back` | `ReactNode` | — | Back face content |
| `trigger` | `"hover" \| "click"` | `"hover"` | What flips it (click is keyboard accessible) |
| `axis` | `"y" \| "x"` | `"y"` | Rotation axis |
| `className / style` | `string / CSSProperties` | `280×180` | Set width / height here |

## Notes for the agent

- Faces fill the card — give your face content its own background.
- Use `trigger="click"` for touch devices (hover flips don't work well on touch).
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
