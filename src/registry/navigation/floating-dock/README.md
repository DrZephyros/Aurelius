---
name: Floating dock
tagline: A macOS-style dock whose icons magnify as you glide across
tags: [nav, mac, icons, portfolio]
deps: []
order: 1
---

# Floating dock

A macOS-style dock whose icons magnify as you glide across.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `floating-dock.tsx` | the component — exports `FloatingDock` |
| `README.md` | these instructions |

## Install

1. Copy `floating-dock.tsx` into the user's project, e.g. `components/aurelius/floating-dock.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { FloatingDock } from "@/components/aurelius/floating-dock";

<div className="fixed bottom-6 left-1/2 -translate-x-1/2">
  <FloatingDock items={[{ label: "Home", icon: <HomeIcon />, href: "/" }]} />
</div>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `{ label: string; icon: ReactNode; href?: string; onClick?: () => void }[]` | — | Dock entries (use <a> via href or <button> via onClick) |
| `size` | `number` | `46` | Base icon size (px) |
| `magnify` | `number` | `1.7` | Peak scale |
| `className / style` | `string / CSSProperties` | — | Position it (e.g. fixed bottom-6 left-1/2 -translate-x-1/2) |

## Notes for the agent

- Icons can be any ReactNode — lucide-react, inline SVG or emoji.
- Tooltips use the `label` (also used as aria-label).
- Pointer-driven only on mouse/pen; on touch the dock behaves as a plain row of buttons.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
