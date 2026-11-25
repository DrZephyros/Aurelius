---
name: Split reveal
tagline: Staggered word or letter reveal with a blur-to-sharp entrance
tags: [heading, scroll, entrance, hero]
deps: []
order: 3
---

# Split reveal

Staggered word or letter reveal with a blur-to-sharp entrance.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `split-reveal.tsx` | the component — exports `SplitReveal` |
| `README.md` | these instructions |

## Install

1. Copy `split-reveal.tsx` into the user's project, e.g. `components/aurelius/split-reveal.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { SplitReveal } from "@/components/aurelius/split-reveal";

<SplitReveal as="h1" text="Launch in a weekend" className="text-7xl font-bold" />
<SplitReveal by="char" stagger={20} text="Hello" />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | — | Text to split |
| `by` | `"word" \| "char"` | `"word"` | Granularity |
| `stagger` | `number` | `55` | Delay between pieces (ms) |
| `duration` | `number` | `900` | Per-piece duration (ms) |
| `blur` | `boolean` | `true` | Start blurred |
| `once` | `boolean` | `true` | Only animate the first time it enters view |
| `as` | `ElementType` | `"span"` | Tag to render (h1, h2, p…) |

## Notes for the agent

- Words never break mid-word (each word is an inline-block).
- Use it for hero headlines — it plays when the element is 40% visible, so it also works below the fold.
- For long paragraphs prefer `by="word"` with a small stagger (20–30ms).
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
