---
name: Skeleton
tagline: Shimmering loading placeholders for cards, avatars and text
tags: [loading, placeholder, ux]
deps: []
order: 4
---

# Skeleton

Shimmering loading placeholders for cards, avatars and text.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `skeleton.tsx` | the component — exports `Skeleton` |
| `README.md` | these instructions |

## Install

1. Copy `skeleton.tsx` into the user's project, e.g. `components/aurelius/skeleton.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { Skeleton } from "@/components/aurelius/skeleton";

{loading ? (
  <div className="flex gap-3"><Skeleton width={44} height={44} radius={999} /><SkeletonText lines={2} /></div>
) : <Profile />}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `width / height` | `number \| string` | `"100%" / 16` | Block size |
| `radius` | `number \| string` | `8` | Corner radius (999 = circle) |
| `SkeletonText lines / gap` | `number` | `3 / 10` | Paragraph placeholder from `SkeletonText` |

## Notes for the agent

- Exports `Skeleton` and `SkeletonText`.
- In Next.js use it inside `loading.tsx` or Suspense fallbacks.
- Match the skeleton's dimensions to the real content to avoid layout shift.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
