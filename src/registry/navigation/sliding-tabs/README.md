---
name: Sliding tabs
tagline: A tab bar whose active pill glides between options
tags: [tabs, nav, dashboard, accessible]
deps: []
order: 2
---

# Sliding tabs

A tab bar whose active pill glides between options.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `sliding-tabs.tsx` | the component — exports `SlidingTabs` |
| `README.md` | these instructions |

## Install

1. Copy `sliding-tabs.tsx` into the user's project, e.g. `components/aurelius/sliding-tabs.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { SlidingTabs } from "@/components/aurelius/sliding-tabs";

<SlidingTabs
  tabs={[{ id: "monthly", label: "Monthly" }, { id: "yearly", label: "Yearly" }]}
  onChange={setBilling}
/>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `tabs` | `{ id: string; label: ReactNode; content?: ReactNode }[]` | — | Tabs. Provide `content` to render panels automatically |
| `value` | `string` | — | Controlled active id |
| `defaultValue` | `string` | `first tab` | Initial id (uncontrolled) |
| `onChange` | `(id: string) => void` | — | Called when the user picks a tab |

## Notes for the agent

- Implements the WAI-ARIA tabs pattern (roles, roving tabindex, arrow keys, Home/End).
- Omit `content` and drive your own UI from `onChange` for toggles like billing period.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
