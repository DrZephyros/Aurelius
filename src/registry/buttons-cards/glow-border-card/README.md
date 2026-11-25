---
name: Glow border card
tagline: A card framed by a slowly rotating gradient border
tags: [card, pricing, highlight, animated-border]
deps: []
order: 5
---

# Glow border card

A card framed by a slowly rotating gradient border.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `glow-border-card.tsx` | the component — exports `GlowBorderCard` |
| `README.md` | these instructions |

## Install

1. Copy `glow-border-card.tsx` into the user's project, e.g. `components/aurelius/glow-border-card.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { GlowBorderCard } from "@/components/aurelius/glow-border-card";

<GlowBorderCard background="#0b0b10" className="max-w-sm">
  <h3>Pro</h3>
</GlowBorderCard>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Card content |
| `colors` | `string[]` | `aurora palette` | Gradient stops |
| `speed` | `number` | `6` | Seconds per rotation |
| `background` | `string` | `"#0a0e17"` | Face colour (must be opaque) |
| `border` | `number` | `1.5` | Border thickness (px) |
| `glow` | `boolean` | `true` | Blurred outer glow |

## Notes for the agent

- Uses CSS `@property` for the animated angle (Chrome, Safari 16.4+, Firefox 128+). Older browsers show a static gradient border.
- `background` must match the page behind it if you want the glow to look seamless.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
