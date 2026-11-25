---
name: Tooltip
tagline: A tiny hover and focus tooltip with four placements
tags: [hint, a11y, ui]
deps: []
order: 3
---

# Tooltip

A tiny hover and focus tooltip with four placements.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `tooltip.tsx` | the component — exports `Tooltip` |
| `README.md` | these instructions |

## Install

1. Copy `tooltip.tsx` into the user's project, e.g. `components/aurelius/tooltip.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { Tooltip } from "@/components/aurelius/tooltip";

<Tooltip content="Copy link"><button aria-label="Copy link"><LinkIcon /></button></Tooltip>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `content` | `ReactNode` | — | Tooltip content |
| `children` | `ReactNode` | — | The trigger (a button, icon, link…) |
| `side` | `"top" \| "bottom" \| "left" \| "right"` | `"top"` | Placement |
| `delay` | `number` | `150` | ms before showing |

## Notes for the agent

- CSS-only positioning — doesn't flip near viewport edges. Choose `side` accordingly.
- Don't put essential information only in a tooltip; touch users can't hover.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
