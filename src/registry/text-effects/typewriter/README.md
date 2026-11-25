---
name: Typewriter
tagline: Types, pauses, deletes and cycles through phrases with a blinking cursor
tags: [hero, terminal, loop]
deps: []
order: 5
---

# Typewriter

Types, pauses, deletes and cycles through phrases with a blinking cursor.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `typewriter.tsx` | the component — exports `Typewriter` |
| `README.md` | these instructions |

## Install

1. Copy `typewriter.tsx` into the user's project, e.g. `components/aurelius/typewriter.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { Typewriter } from "@/components/aurelius/typewriter";

<p className="font-mono text-2xl">
  <Typewriter phrases={["Design.", "Build.", "Ship."]} />
</p>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `phrases` | `string[]` | — | Phrases to type |
| `typeSpeed` | `number` | `55` | ms per character (randomised ±40%) |
| `deleteSpeed` | `number` | `28` | ms per deleted character |
| `pause` | `number` | `1500` | Hold time after a phrase completes |
| `loop` | `boolean` | `true` | Cycle forever |
| `cursor` | `string` | `"▍"` | Cursor glyph |

## Notes for the agent

- The first phrase is rendered on the server so there is no empty flash for no-JS / reduced-motion users.
- Wrap in a fixed `min-height` container if surrounding layout must not move while the text wraps.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
