---
name: Horizontal scroll
tagline: A pinned section where vertical scrolling slides a horizontal gallery
tags: [gallery, portfolio, storytelling, pinned]
deps: []
order: 5
---

# Horizontal scroll

A pinned section where vertical scrolling slides a horizontal gallery.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `horizontal-scroll.tsx` | the component — exports `HorizontalScroll` |
| `README.md` | these instructions |

## Install

1. Copy `horizontal-scroll.tsx` into the user's project, e.g. `components/aurelius/horizontal-scroll.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { HorizontalScroll } from "@/components/aurelius/horizontal-scroll";

<HorizontalScroll>
  {slides.map((s) => <div key={s.id} className="w-[70vw] h-[70vh] shrink-0 rounded-3xl bg-zinc-900">{s.title}</div>)}
</HorizontalScroll>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Panels (flex children). Give each a width, e.g. `className="w-[70vw] shrink-0"` |
| `gap` | `number` | `24` | Gap between panels (px) |
| `progress` | `boolean` | `true` | Show a progress line |

## Notes for the agent

- The component sets its own height from the track width, so the rest of the page keeps flowing normally after it.
- Don't put it inside another scroll container or an element with `overflow` / `transform` set — `position: sticky` needs the window to scroll.
- Test on mobile: very wide tracks mean very tall sections.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
