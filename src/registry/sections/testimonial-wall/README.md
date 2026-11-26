---
name: Testimonial wall
tagline: Auto-scrolling columns of social proof, alternating direction
tags: [testimonials, social-proof, landing]
deps: []
order: 5
---

# Testimonial wall

Auto-scrolling columns of social proof, alternating direction.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `testimonial-wall.tsx` | the component — exports `TestimonialWall` |
| `README.md` | these instructions |

## Install

1. Copy `testimonial-wall.tsx` into the user's project, e.g. `components/aurelius/testimonial-wall.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { TestimonialWall } from "@/components/aurelius/testimonial-wall";

<TestimonialWall testimonials={reviews} columns={3} height={600} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `testimonials` | `{ quote: string; name: string; role?: string; avatar?: string }[]` | — | Cards (provide at least 6 for a smooth loop) |
| `columns` | `2 \| 3 \| 4` | `3` | Number of columns (collapses on small screens) |
| `duration` | `number` | `50` | Seconds per loop |
| `height` | `number` | `560` | Wall height (px) |

## Notes for the agent

- Cards are duplicated for the seamless loop; duplicates are `aria-hidden`.
- On phones it falls back to 1–2 columns.
- Use real quotes — fake testimonials hurt trust.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
