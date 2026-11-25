---
name: Glitch text
tagline: RGB-split cyberpunk glitch on hover or on loop
tags: [cyberpunk, hover, gaming, 404]
deps: []
order: 8
---

# Glitch text

RGB-split cyberpunk glitch on hover or on loop.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `glitch-text.tsx` | the component — exports `GlitchText` |
| `README.md` | these instructions |

## Install

1. Copy `glitch-text.tsx` into the user's project, e.g. `components/aurelius/glitch-text.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { GlitchText } from "@/components/aurelius/glitch-text";

<GlitchText as="h1" text="404" active="always" className="text-9xl font-black" />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | — | The text (single line) |
| `active` | `"hover" \| "always"` | `"hover"` | When the glitch plays |
| `colorA / colorB` | `string` | `"#ff2d6f" / "#00e5ff"` | Split-layer colours |
| `as` | `ElementType` | `"span"` | Tag |

## Notes for the agent

- Pure CSS (pseudo-elements with `data-text`) — no JS runtime cost.
- Best on dark backgrounds because the layers use `mix-blend-mode: screen`.
- Text must be a string; avoid on long paragraphs.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
