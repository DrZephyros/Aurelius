---
name: Scramble text
tagline: Text that decodes from random characters, left to right
tags: [heading, hover, hacker, stats]
deps: []
order: 1
---

# Scramble text

Text that decodes from random characters, left to right.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `scramble-text.tsx` | the component — exports `ScrambleText` |
| `README.md` | these instructions |

## Install

1. Copy `scramble-text.tsx` into the user's project, e.g. `components/aurelius/scramble-text.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { ScrambleText } from "@/components/aurelius/scramble-text";

<ScrambleText as="h1" text="Ship faster" className="text-6xl font-bold" />
<ScrambleText trigger="hover" text="Read the docs" />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | — | Final text |
| `trigger` | `"view" \| "hover" \| "mount"` | `"view"` | When the effect runs |
| `once` | `boolean` | `false` | With `trigger="view"`: play only on the first entry. By default it replays every time it scrolls back into view |
| `interval` | `number` | `0` | Replay every N ms while visible (0 = off) |
| `duration` | `number` | `1000` | Total time in ms |
| `chars` | `string` | `"!<>-_\\/[]{}—=+*^?#0123456789"` | Noise alphabet |
| `as` | `ElementType` | `"span"` | Tag to render (h1, p, a…) |
| `className / style` | `string / CSSProperties` | — | Applied to the wrapper |

## Notes for the agent

- Pass plain strings only (it measures characters). For rich text, wrap each segment separately.
- Screen readers get the final text via `aria-label`; the scrambled glyphs are `aria-hidden`.
- Use `key={something}` on the element to replay the effect.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
