---
name: Sticky stack
tagline: Cards that pin and stack up as you scroll, shrinking and dimming as the next arrives
tags: [features, storytelling, apple-style, pinned]
deps: []
order: 6
---

# Sticky stack

Cards that pin and stack up as you scroll, shrinking and dimming as the next arrives.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `sticky-stack.tsx` | the component — exports `StickyStack` |
| `README.md` | these instructions |

## Install

1. Copy `sticky-stack.tsx` into the user's project, e.g. `components/aurelius/sticky-stack.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { StickyStack } from "@/components/aurelius/sticky-stack";

<StickyStack
  cards={steps.map((s) => <div className="h-full p-10 bg-indigo-600">{s.title}</div>)}
/>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `cards` | `ReactNode[]` | — | One element per card; each should have its own background and fill the box |
| `cardHeight` | `string` | `"62vh"` | Height of each card |
| `top` | `number` | `96` | Pin offset from the top (px) — use your navbar height + gap |
| `peek` | `number` | `22` | Offset between stacked cards (px) |

## Notes for the agent

- The preview on this site is a static illustration — the real behaviour needs window scroll.
- Like all `position: sticky` layouts, no ancestor may have `overflow: hidden/auto`.
- Leave extra bottom padding after the stack so the last card can be read.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
