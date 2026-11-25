---
name: Reveal
tagline: Fade, slide, scale or blur anything in as it scrolls into view
tags: [scroll, entrance, wrapper, essential]
deps: []
order: 1
---

# Reveal

Fade, slide, scale or blur anything in as it scrolls into view.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `reveal.tsx` | the component — exports `Reveal` |
| `README.md` | these instructions |

## Install

1. Copy `reveal.tsx` into the user's project, e.g. `components/aurelius/reveal.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { Reveal } from "@/components/aurelius/reveal";

<Reveal><h2>Features</h2></Reveal>
{items.map((it, i) => <Reveal key={it.id} delay={i * 100}><Card {...it} /></Reveal>)}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Content to reveal |
| `variant` | `"up" \| "down" \| "left" \| "right" \| "fade" \| "scale" \| "blur"` | `"up"` | Entrance style |
| `delay` | `number` | `0` | ms — stagger siblings by incrementing this |
| `duration` | `number` | `900` | ms |
| `distance` | `number` | `32` | Travel distance (px) |
| `once` | `boolean` | `true` | Only the first time |
| `threshold` | `number` | `0.15` | Visible fraction to trigger |
| `as` | `ElementType` | `"div"` | Wrapper tag |

## Notes for the agent

- This is the single most useful scroll animation — wrap each section block with it.
- Stagger a list by passing `delay={i * 100}`.
- Content is visible without JS only if you add `<noscript><style>.au-rv{opacity:1!important;transform:none!important}</style></noscript>`.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
