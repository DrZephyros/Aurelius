---
name: Scroll-lit text
tagline: A paragraph whose words ignite one by one as you scroll
tags: [manifesto, scroll, paragraph, storytelling]
deps: []
order: 6
---

# Scroll-lit text

A paragraph whose words ignite one by one as you scroll.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `scroll-lit-text.tsx` | the component — exports `ScrollLitText` |
| `README.md` | these instructions |

## Install

1. Copy `scroll-lit-text.tsx` into the user's project, e.g. `components/aurelius/scroll-lit-text.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { ScrollLitText } from "@/components/aurelius/scroll-lit-text";

<ScrollLitText
  className="mx-auto max-w-3xl text-5xl font-semibold leading-tight"
  text="You bring the *idea.* We bring the *light.*"
/>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | — | Paragraph. Wrap words in *asterisks* for the glowing accent |
| `accent` | `string` | `"#5cffc4"` | Accent colour for emphasised words |
| `scroller` | `HTMLElement \| string` | auto | Scroll container to track. Defaults to the nearest scrollable ancestor, otherwise the page |
| `className / style` | `string / CSSProperties` | — | Typography goes here (size, weight, line-height) |

## Notes for the agent

- Works with the page scroll *and* with inner scroll areas (modals, panels, split layouts) — it finds the scroller itself. It needs something to scroll to animate — give it room (e.g. `py-[40vh]`) so the user can scroll it through the viewport.
- The text colour is inherited; dimmed words use opacity, so it works on any background.
- Emphasised words use `accent` for colour + glow.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
