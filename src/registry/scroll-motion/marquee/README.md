---
name: Marquee
tagline: A seamless infinite scroller for logos, tags or text — horizontal or vertical
tags: [logos, loop, ticker, essential]
deps: []
order: 2
---

# Marquee

A seamless infinite scroller for logos, tags or text — horizontal or vertical.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `marquee.tsx` | the component — exports `Marquee` |
| `README.md` | these instructions |

## Install

1. Copy `marquee.tsx` into the user's project, e.g. `components/aurelius/marquee.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { Marquee } from "@/components/aurelius/marquee";

<Marquee duration={40}>
  {logos.map((l) => <img key={l} src={l} height={28} alt="" />)}
</Marquee>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Items (render several so one copy is wider than the container) |
| `duration` | `number` | `30` | Seconds per loop |
| `reverse` | `boolean` | `false` | Opposite direction |
| `pauseOnHover` | `boolean` | `true` | Pause when hovered |
| `vertical` | `boolean` | `false` | Scroll vertically (give it a height) |
| `gap` | `number` | `32` | Space between items (px) |
| `fade` | `boolean` | `true` | Fade the edges |

## Notes for the agent

- If your items are fewer/narrower than the container, repeat them inside `children` so one copy fills the width — otherwise a gap appears.
- The duplicate track is `aria-hidden`, so screen readers don't read items twice.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
