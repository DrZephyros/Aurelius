---
name: Copy button
tagline: Copy-to-clipboard with an animated check and a fallback for insecure contexts
tags: [code, docs, clipboard]
deps: []
order: 2
---

# Copy button

Copy-to-clipboard with an animated check and a fallback for insecure contexts.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `copy-button.tsx` | the component — exports `CopyButton` |
| `README.md` | these instructions |

## Install

1. Copy `copy-button.tsx` into the user's project, e.g. `components/aurelius/copy-button.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { CopyButton } from "@/components/aurelius/copy-button";

<CopyButton text={code} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | — | What to copy |
| `label / copiedLabel` | `string` | `"Copy" / "Copied!"` | Button texts |
| `children` | `ReactNode` | — | Fully custom content (overrides label) |
| `onCopy` | `() => void` | — | Callback after copying |

## Notes for the agent

- Falls back to `document.execCommand` when the Clipboard API is unavailable (non-HTTPS, older browsers).
- Pair it with a `<pre>` block for code snippets.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
