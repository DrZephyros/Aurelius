---
name: Gradient mesh
tagline: Colour blobs that glide toward the pointer, with film grain
tags: [hero, interactive, gradient, pointer]
deps: []
order: 2
---

# Gradient mesh

Colour blobs that glide toward the pointer, with film grain.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `gradient-mesh.tsx` | the component — exports `GradientMesh` |
| `README.md` | these instructions |

## Install

1. Copy `gradient-mesh.tsx` into the user's project, e.g. `components/aurelius/gradient-mesh.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { GradientMesh } from "@/components/aurelius/gradient-mesh";

<GradientMesh className="min-h-[80vh] grid place-items-center">
  <h1 className="text-7xl font-bold">Hello</h1>
</GradientMesh>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `colors` | `string[]` | `["#3de7ff","#a58bff","#ff7ad9","#5cffc4"]` | Up to 4 blob colours |
| `follow` | `number` | `0.6` | Pointer influence 0–1 |
| `background` | `string` | `"#06080f"` | Base colour |
| `children` | `ReactNode` | — | Foreground content |

## Notes for the agent

- Pauses its animation loop when off-screen (IntersectionObserver).
- Pointer is tracked on the wrapper only, so it never interferes with the rest of the page.
- `mix-blend-mode: difference` on text over this looks great; see the demo.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
