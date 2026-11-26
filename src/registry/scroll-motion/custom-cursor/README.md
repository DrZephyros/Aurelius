---
name: Custom cursor
tagline: A dot and trailing ring that swell over interactive elements
tags: [cursor, pointer, portfolio, global]
deps: []
order: 4
---

# Custom cursor

A dot and trailing ring that swell over interactive elements.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `custom-cursor.tsx` | the component — exports `CustomCursor` |
| `README.md` | these instructions |

## Install

1. Copy `custom-cursor.tsx` into the user's project, e.g. `components/aurelius/custom-cursor.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { CustomCursor } from "@/components/aurelius/custom-cursor";

// app/layout.tsx — once
<body>
  <CustomCursor />
  {children}
</body>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `color` | `string` | `"#5cffc4"` | Dot + ring colour |
| `hideNative` | `boolean` | `true` | Hide the system cursor (adds a class on <html>) |
| `hoverSelector` | `string` | `links, buttons, inputs…` | Selector that makes the ring grow; add `data-cursor` to any element to opt in |

## Notes for the agent

- Global component: mount it exactly once. It does nothing on touch devices (`pointer: coarse`).
- Uses `mix-blend-mode: difference` so it reads on both light and dark sections.
- Keep native cursors for text inputs if accessibility testing requires — set `hideNative={false}`.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
