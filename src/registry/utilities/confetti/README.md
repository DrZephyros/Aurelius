---
name: Confetti
tagline: A one-line confetti burst for sign-ups, purchases and milestones
tags: [celebration, success, delight]
deps: []
order: 5
---

# Confetti

A one-line confetti burst for sign-ups, purchases and milestones.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `confetti.tsx` | the component — exports `fireConfetti` |
| `README.md` | these instructions |

## Install

1. Copy `confetti.tsx` into the user's project, e.g. `components/aurelius/confetti.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { fireConfetti } from "@/components/aurelius/confetti";

import { fireConfetti } from "@/components/aurelius/confetti";

<button onClick={(e) => fireConfetti({ x: e.clientX, y: e.clientY })}>Done!</button>
// or after an async success:  fireConfetti();
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `x / y` | `number` | `bottom-centre` | Origin in viewport px (use the click position) |
| `count` | `number` | `140` | Particles |
| `colors` | `string[]` | `aurora palette` | Colours |
| `spread` | `number` | `70` | Spread angle (deg) around straight up |
| `power` | `number` | `16` | Initial speed |

## Notes for the agent

- It's a function, not a component: call it from event handlers or `useEffect` (client side only).
- Creates and removes its own canvas, so there is nothing to mount.
- Skipped automatically for `prefers-reduced-motion`.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
