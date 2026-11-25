---
name: Highlight text
tagline: A marker highlight, underline or strike that draws itself on scroll
tags: [inline, emphasis, marketing]
deps: []
order: 7
---

# Highlight text

A marker highlight, underline or strike that draws itself on scroll.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `highlight-text.tsx` | the component — exports `HighlightText` |
| `README.md` | these instructions |

## Install

1. Copy `highlight-text.tsx` into the user's project, e.g. `components/aurelius/highlight-text.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { HighlightText } from "@/components/aurelius/highlight-text";

<p className="text-4xl">
  Ship <HighlightText>10x faster</HighlightText> with <HighlightText variant="underline" color="#ffd28a">zero setup</HighlightText>.
</p>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | Inline content to highlight (wraps across lines correctly) |
| `variant` | `"marker" \| "underline" \| "strike"` | `"marker"` | Drawing style |
| `color` | `string` | `"rgb(92 255 196 / 0.45)"` | Any CSS colour |
| `delay` | `number` | `150` | ms after entering view |
| `duration` | `number` | `800` | ms to draw |

## Notes for the agent

- It's an inline `<span>` using `box-decoration-break: clone`, so highlights wrap across multiple lines correctly.
- Stagger several highlights in one paragraph by increasing `delay`.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
