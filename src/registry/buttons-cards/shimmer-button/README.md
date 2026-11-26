---
name: Shimmer button
tagline: A pill CTA with a light beam circling its border
tags: [cta, hero, animated-border]
deps: []
order: 2
---

# Shimmer button

A pill CTA with a light beam circling its border.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `shimmer-button.tsx` | the component — exports `ShimmerButton` |
| `README.md` | these instructions |

## Install

1. Copy `shimmer-button.tsx` into the user's project, e.g. `components/aurelius/shimmer-button.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { ShimmerButton } from "@/components/aurelius/shimmer-button";

<ShimmerButton href="/pricing">See pricing</ShimmerButton>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Label |
| `glow` | `string` | `"#5cffc4"` | Beam colour |
| `background` | `string` | `"#0b1220"` | Face colour |
| `href` | `string` | — | Renders an <a> |
| `onClick` | `() => void` | — | Click handler |

## Notes for the agent

- Best on dark backgrounds. For light pages set `background` to a dark brand colour.
- Pure CSS; the conic gradient rotates via transform (GPU friendly).
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
