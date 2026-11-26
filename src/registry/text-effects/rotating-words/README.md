---
name: Rotating words
tagline: An inline word that slides and blurs through a list
tags: [hero, heading, loop]
deps: []
order: 4
---

# Rotating words

An inline word that slides and blurs through a list.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `rotating-words.tsx` | the component — exports `RotatingWords` |
| `README.md` | these instructions |

## Install

1. Copy `rotating-words.tsx` into the user's project, e.g. `components/aurelius/rotating-words.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { RotatingWords } from "@/components/aurelius/rotating-words";

<h1 className="text-6xl font-bold">
  We make <RotatingWords words={["apps", "brands", "magic"]} />
</h1>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `words` | `string[]` | — | Words to cycle through (2+) |
| `interval` | `number` | `2200` | Milliseconds per word |
| `color` | `string` | `var(--au-accent, #5cffc4)` | Text colour of the rotating word |
| `className / style` | `string / CSSProperties` | — | Applied to the inline wrapper |

## Notes for the agent

- Place it inline inside a heading; it inherits font size/weight from the parent.
- Stable width: the widest word sets the width, so surrounding text doesn't shift.
- To rotate gradient text, pass `color="transparent"` and style it via `className`.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
