---
name: Grid spotlight
tagline: A blueprint grid that lights up under the cursor
tags: [hero, grid, pointer, css-only]
deps: []
order: 6
---

# Grid spotlight

A blueprint grid that lights up under the cursor.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `grid-spotlight.tsx` | the component — exports `GridSpotlight` |
| `README.md` | these instructions |

## Install

1. Copy `grid-spotlight.tsx` into the user's project, e.g. `components/aurelius/grid-spotlight.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { GridSpotlight } from "@/components/aurelius/grid-spotlight";

<GridSpotlight className="min-h-screen bg-black grid place-items-center">
  <h1 className="text-6xl">Hello</h1>
</GridSpotlight>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `cell` | `number` | `48` | Grid cell size (px) |
| `radius` | `number` | `260` | Spotlight radius (px) |
| `lineColor` | `string` | `"rgba(255,255,255,0.06)"` | Idle line colour |
| `glowColor` | `string` | `"rgba(92,255,196,0.55)"` | Line colour under the spotlight |
| `children` | `ReactNode` | — | Foreground content |

## Notes for the agent

- Uses CSS masks (supported in all evergreen browsers).
- Touch devices just show the idle grid (no hover) — that is intended.
- Set a dark `background` on the wrapper via className/style.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
