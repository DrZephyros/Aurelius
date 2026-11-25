---
name: Dot grid
tagline: A canvas dot grid that swells, glows and springs around your cursor
tags: [hero, interactive, canvas, pointer]
deps: []
order: 3
---

# Dot grid

A canvas dot grid that swells, glows and springs around your cursor.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `dot-grid.tsx` | the component — exports `DotGrid` |
| `README.md` | these instructions |

## Install

1. Copy `dot-grid.tsx` into the user's project, e.g. `components/aurelius/dot-grid.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { DotGrid } from "@/components/aurelius/dot-grid";

<DotGrid className="h-[70vh]">
  <div className="p-24"><h1>Hello</h1></div>
</DotGrid>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `gap` | `number` | `26` | Spacing between dots (px) |
| `size` | `number` | `1.5` | Dot radius (px) |
| `color` | `string` | `"rgba(255,255,255,0.16)"` | Resting dot colour |
| `activeColor` | `string` | `"#5cffc4"` | Colour near the pointer |
| `radius` | `number` | `150` | Pointer influence radius (px) |
| `children` | `ReactNode` | — | Content above the canvas |

## Notes for the agent

- The wrapper needs a height (class or style) — the canvas fills it and resizes with a ResizeObserver.
- Loop pauses when off-screen. DPR is capped at 2.
- For large areas raise `gap` to keep the dot count under ~4000.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
