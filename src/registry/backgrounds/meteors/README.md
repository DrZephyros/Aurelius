---
name: Meteors
tagline: Shooting stars streaking across a night-sky section
tags: [hero, space, css-only, ambient]
deps: []
order: 5
---

# Meteors

Shooting stars streaking across a night-sky section.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `meteors.tsx` | the component — exports `Meteors` |
| `README.md` | these instructions |

## Install

1. Copy `meteors.tsx` into the user's project, e.g. `components/aurelius/meteors.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { Meteors } from "@/components/aurelius/meteors";

<Meteors className="relative min-h-screen bg-slate-950">
  <h1 className="p-24 text-6xl">Hello</h1>
</Meteors>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `count` | `number` | `14` | Number of meteors |
| `color` | `string` | `"#cfe9ff"` | Meteor colour |
| `children` | `ReactNode` | — | Foreground content |

## Notes for the agent

- Wrapper is `overflow: hidden` — give it a height and a dark background.
- CSS-only animation; negligible CPU.
- Meteors travel down-left; flip the rotation in the CSS for the other direction.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
