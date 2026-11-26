---
name: Parallax
tagline: Layers that move at different speeds from the page scroll
tags: [depth, hero, scroll, images]
deps: []
order: 3
---

# Parallax

Layers that move at different speeds from the page scroll.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `parallax.tsx` | the component — exports `Parallax` |
| `README.md` | these instructions |

## Install

1. Copy `parallax.tsx` into the user's project, e.g. `components/aurelius/parallax.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { Parallax } from "@/components/aurelius/parallax";

<section className="relative h-[120vh] overflow-hidden">
  <Parallax speed={0.4}><img src="/mountains.jpg" alt="" /></Parallax>
  <Parallax speed={-0.2}><h1>Title</h1></Parallax>
</section>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Content to move |
| `speed` | `number` | `0.25` | −1…1; positive = slower than the page |
| `axis` | `"y" \| "x"` | `"y"` | Direction of travel |
| `as` | `ElementType` | `"div"` | Wrapper tag |

## Notes for the agent

- Put an `overflow-hidden` ancestor around the parallax layers so moved content doesn't spill.
- Only measures while near the viewport; transforms are written directly to the element (no React renders).
- The preview here simulates scroll; the real component follows the page.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
