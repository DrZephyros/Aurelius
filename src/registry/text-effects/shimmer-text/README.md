---
name: Shimmer text
tagline: A light sweep or a flowing colour gradient across any text
tags: [gradient, loading, heading, ai]
deps: []
order: 2
---

# Shimmer text

A light sweep or a flowing colour gradient across any text.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `shimmer-text.tsx` | the component — exports `ShimmerText` |
| `README.md` | these instructions |

## Install

1. Copy `shimmer-text.tsx` into the user's project, e.g. `components/aurelius/shimmer-text.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { ShimmerText } from "@/components/aurelius/shimmer-text";

<h1 className="text-6xl font-bold">
  Build <ShimmerText mode="flow">something wild</ShimmerText>
</h1>
<ShimmerText>Generating…</ShimmerText>  {/* classic AI 'thinking' shimmer */}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | The text |
| `mode` | `"shimmer" \| "flow"` | `"shimmer"` | Sweep highlight vs. flowing multi-colour gradient |
| `from / via` | `string` | `"#7d8aa0" / "#fff"` | shimmer base and highlight colours |
| `colors` | `string[]` | `aurora palette` | flow gradient stops (first stop is repeated to loop seamlessly) |
| `speed` | `number` | `2.8 / 6` | Seconds per loop |
| `as` | `ElementType` | `"span"` | Tag to render |

## Notes for the agent

- Because the text is transparent with a clipped background, the parent `color` has no effect on it — use `from`/`colors`.
- Works inline inside a heading; set `as="div"` for block usage.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
