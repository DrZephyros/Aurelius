---
name: Hero (centred)
tagline: A finished landing hero: badge, headline, subcopy, CTAs and a glowing grid backdrop
tags: [hero, landing, saas, above-the-fold]
deps: []
order: 1
---

# Hero (centred)

A finished landing hero: badge, headline, subcopy, CTAs and a glowing grid backdrop.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `hero-centered.tsx` | the component — exports `HeroCentered` |
| `README.md` | these instructions |

## Install

1. Copy `hero-centered.tsx` into the user's project, e.g. `components/aurelius/hero-centered.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { HeroCentered } from "@/components/aurelius/hero-centered";

<HeroCentered
  badge="New · v2"
  title={<>Build faster with <em>Acme</em></>}
  subtitle="The toolkit for shipping weekends."
  primary={{ label: "Start free", href: "/signup" }}
/>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `badge` | `ReactNode` | — | Small pill above the title |
| `title` | `ReactNode` | — | Headline (use <span> for accent words) |
| `subtitle` | `ReactNode` | — | Supporting copy |
| `primary / secondary` | `{ label: string; href: string }` | — | Buttons |
| `children` | `ReactNode` | — | Rendered below the buttons (screenshot, code, logos) |

## Notes for the agent

- Designed for dark backgrounds; the glow uses `--au-accent`.
- Combine with `ShimmerText` / `SplitReveal` inside `title` for extra flair.
- Add `<SmartNavbar />` above it and a `pt-16` if the navbar is fixed.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
