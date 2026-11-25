---
name: Scroll progress
tagline: A slim reading-progress bar pinned to the top of the viewport
tags: [blog, docs, reading, nav]
deps: []
order: 4
---

# Scroll progress

A slim reading-progress bar pinned to the top of the viewport.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `scroll-progress.tsx` | the component — exports `ScrollProgress` |
| `README.md` | these instructions |

## Install

1. Copy `scroll-progress.tsx` into the user's project, e.g. `components/aurelius/scroll-progress.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { ScrollProgress } from "@/components/aurelius/scroll-progress";

// app/layout.tsx
<body>
  <ScrollProgress />
  {children}
</body>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `color` | `string` | `aurora gradient` | CSS colour or gradient |
| `height` | `number` | `3` | Bar height (px) |
| `position` | `"top" \| "bottom"` | `"top"` | Viewport edge |
| `zIndex` | `number` | `60` | Stacking order |

## Notes for the agent

- Mount it once in the root layout (or the blog post layout).
- Uses `transform: scaleX`, so scrolling stays smooth.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
