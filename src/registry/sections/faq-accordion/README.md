---
name: FAQ accordion
tagline: An accessible accordion with silky height animation
tags: [faq, landing, accessible, support]
deps: []
order: 4
---

# FAQ accordion

An accessible accordion with silky height animation.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `faq-accordion.tsx` | the component — exports `FaqAccordion` |
| `README.md` | these instructions |

## Install

1. Copy `faq-accordion.tsx` into the user's project, e.g. `components/aurelius/faq-accordion.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { FaqAccordion } from "@/components/aurelius/faq-accordion";

<FaqAccordion items={[{ q: "How does billing work?", a: "Monthly, cancel anytime." }]} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `{ q: string; a: ReactNode }[]` | — | Questions and answers (answers can be JSX) |
| `multiple` | `boolean` | `false` | Allow several open at once |
| `defaultOpen` | `number` | — | Index to open initially |

## Notes for the agent

- Buttons use `aria-expanded` / `aria-controls`; panels are `role=region`.
- Animates `grid-template-rows` 0fr→1fr, so no JS height measurement is needed.
- Add FAQ structured data (JSON-LD) separately if you care about SEO rich results.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
