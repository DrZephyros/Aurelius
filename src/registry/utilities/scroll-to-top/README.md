---
name: Scroll to top
tagline: A floating back-to-top button with a scroll-progress ring
tags: [navigation, long-pages, blog]
deps: []
order: 3
---

# Scroll to top

A floating back-to-top button with a scroll-progress ring.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `scroll-to-top.tsx` | the component — exports `ScrollToTop` |
| `README.md` | these instructions |

## Install

1. Copy `scroll-to-top.tsx` into the user's project, e.g. `components/aurelius/scroll-to-top.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { ScrollToTop } from "@/components/aurelius/scroll-to-top";

// app/layout.tsx
<ScrollToTop />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `threshold` | `number` | `480` | Show after this many px |
| `size` | `number` | `52` | Diameter (px) |
| `color` | `string` | `"#5cffc4"` | Ring colour |

## Notes for the agent

- Fixed to the bottom-right. Override `style` (`right`, `bottom`) to move it, e.g. to avoid a chat widget.
- Hidden (and not focusable) until the threshold is passed.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
