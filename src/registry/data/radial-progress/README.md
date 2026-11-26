---
name: Radial progress
tagline: A gradient score ring that animates to its value
tags: [progress, score, dashboard, svg]
deps: []
order: 3
---

# Radial progress

A gradient score ring that animates to its value.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `radial-progress.tsx` | the component — exports `RadialProgress` |
| `README.md` | these instructions |

## Install

1. Copy `radial-progress.tsx` into the user's project, e.g. `components/aurelius/radial-progress.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { RadialProgress } from "@/components/aurelius/radial-progress";

<RadialProgress value={72} size={160} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | — | 0–100 |
| `size` | `number` | `140` | Diameter (px) |
| `thickness` | `number` | `10` | Ring thickness (px) |
| `colors` | `[string, string]` | `aurora` | Gradient start / end |
| `children` | `ReactNode` | `percentage` | Custom centre content |

## Notes for the agent

- Has `role=progressbar` with `aria-valuenow`.
- Re-animates smoothly when `value` changes.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
