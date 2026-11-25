---
name: Constellation
tagline: Drifting particles joined by lines that reach for your cursor
tags: [hero, canvas, particles, pointer]
deps: []
order: 4
---

# Constellation

Drifting particles joined by lines that reach for your cursor.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `constellation.tsx` | the component — exports `Constellation` |
| `README.md` | these instructions |

## Install

1. Copy `constellation.tsx` into the user's project, e.g. `components/aurelius/constellation.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { Constellation } from "@/components/aurelius/constellation";

<Constellation className="h-screen">
  <div className="p-24"><h1>Hello</h1></div>
</Constellation>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `count` | `number` | `auto` | Number of particles (scales with area, max 140) |
| `color` | `string` | `"#8fe9ff"` | Particle + line colour |
| `linkDistance` | `number` | `120` | Max distance to link two particles (px) |
| `speed` | `number` | `1` | Drift multiplier |
| `interactive` | `boolean` | `true` | React to the pointer |
| `children` | `ReactNode` | — | Foreground content |

## Notes for the agent

- Wrapper needs a height. Canvas is sized with ResizeObserver and DPR ≤ 2.
- Link computation is O(n²) — keep `count` ≤ ~150.
- Animation stops when off-screen.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
