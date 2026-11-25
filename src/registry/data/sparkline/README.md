---
name: Sparkline
tagline: A tiny smooth trend line that draws itself in
tags: [chart, kpi, dashboard, svg]
deps: []
order: 1
---

# Sparkline

A tiny smooth trend line that draws itself in.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `sparkline.tsx` | the component — exports `Sparkline` |
| `README.md` | these instructions |

## Install

1. Copy `sparkline.tsx` into the user's project, e.g. `components/aurelius/sparkline.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { Sparkline } from "@/components/aurelius/sparkline";

<Sparkline data={[3, 5, 4, 8, 12, 10, 15]} color="#a58bff" />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` | `number[]` | — | Values (2+) |
| `width / height` | `number` | `160 / 44` | Size in px |
| `color` | `string` | `"#5cffc4"` | Line colour |
| `fill` | `boolean` | `true` | Gradient area under the line |
| `animate` | `boolean` | `true` | Draw in on scroll |
| `strokeWidth` | `number` | `2` | Line width |

## Notes for the agent

- Pure SVG; `pathLength=1` makes the draw animation independent of the real length.
- Include it in tables / cards; it scales via the `width` / `height` props.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
