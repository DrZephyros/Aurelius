---
name: Aurora background
tagline: Slow-drifting aurora light behind any section
tags: [hero, gradient, ambient, css-only]
deps: []
order: 1
---

# Aurora background

Slow-drifting aurora light behind any section.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `aurora-background.tsx` | the component — exports `AuroraBackground` |
| `README.md` | these instructions |

## Install

1. Copy `aurora-background.tsx` into the user's project, e.g. `components/aurelius/aurora-background.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { AuroraBackground } from "@/components/aurelius/aurora-background";

<AuroraBackground className="min-h-screen grid place-items-center">
  <h1 className="text-6xl font-bold">Hello</h1>
</AuroraBackground>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `colors` | `string[]` | `["#5cffc4","#3de7ff","#a58bff","#ff7ad9"]` | Up to 4 blob colours |
| `blur` | `number` | `90` | Blur radius (px) |
| `intensity` | `number` | `0.55` | Overall opacity 0–1 |
| `grid` | `boolean` | `true` | Faint grid overlay |
| `background` | `string` | `"#04060c"` | Base background colour |
| `children` | `ReactNode` | — | Content rendered above the aurora |

## Notes for the agent

- Pure CSS animation (GPU transforms) — no canvas, no JS loop. Safe for mobile.
- The wrapper is `position: relative; overflow: hidden`; give it a height (e.g. `min-h-screen`) or let content size it.
- For a light theme, lower `intensity` (~0.35) and set `background` to a light colour; use darker `colors`.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
