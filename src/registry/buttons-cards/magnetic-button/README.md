---
name: Magnetic button
tagline: A button that leans toward the cursor with a parallax label
tags: [cta, hover, pointer]
deps: []
order: 1
---

# Magnetic button

A button that leans toward the cursor with a parallax label.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `magnetic-button.tsx` | the component — exports `MagneticButton` |
| `README.md` | these instructions |

## Install

1. Copy `magnetic-button.tsx` into the user's project, e.g. `components/aurelius/magnetic-button.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { MagneticButton } from "@/components/aurelius/magnetic-button";

<MagneticButton href="/signup">Start free</MagneticButton>
<MagneticButton onClick={() => alert("hi")} style={{ background: "white", color: "black" }}>Click</MagneticButton>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Button label / content |
| `strength` | `number` | `0.35` | How far it follows the pointer |
| `href` | `string` | — | Renders an <a> instead of a <button> |
| `onClick` | `() => void` | — | Click handler |
| `className / style` | `string / CSSProperties` | — | Override the look (background, color, border…) |

## Notes for the agent

- Disabled for touch pointers.
- Default look uses `--au-accent` / `--au-bg`; override via `style` or `className`.
- Leave ~20px of space around it so the movement doesn't overlap neighbours.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
