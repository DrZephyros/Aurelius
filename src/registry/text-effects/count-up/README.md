---
name: Count up
tagline: A number that eases up to its value when it scrolls into view
tags: [stats, numbers, kpi]
deps: []
order: 9
---

# Count up

A number that eases up to its value when it scrolls into view.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `count-up.tsx` | the component — exports `CountUp` |
| `README.md` | these instructions |

## Install

1. Copy `count-up.tsx` into the user's project, e.g. `components/aurelius/count-up.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { CountUp } from "@/components/aurelius/count-up";

<div className="text-6xl font-bold"><CountUp to={12840} suffix="+" /> customers</div>
<CountUp to={99.9} decimals={1} suffix="%" />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `to` | `number` | — | Final value |
| `from` | `number` | `0` | Start value |
| `duration` | `number` | `1800` | ms |
| `decimals` | `number` | `0` | Fraction digits |
| `prefix / suffix` | `string` | `""` | Text before / after the number |
| `locale` | `string` | `"en-US"` | Digit grouping locale ("" disables) |

## Notes for the agent

- Server render shows the final value (good for SEO / no-JS); the client resets to `from` and animates when 50% visible.
- Uses tabular numerals so the width doesn't jitter.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
