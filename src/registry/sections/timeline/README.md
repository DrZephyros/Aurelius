---
name: Timeline
tagline: A scroll-lit vertical timeline for roadmaps, history and process steps
tags: [roadmap, about, process, scroll]
deps: []
order: 8
---

# Timeline

A scroll-lit vertical timeline for roadmaps, history and process steps.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `timeline.tsx` | the component — exports `Timeline` |
| `README.md` | these instructions |

## Install

1. Copy `timeline.tsx` into the user's project, e.g. `components/aurelius/timeline.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { Timeline } from "@/components/aurelius/timeline";

<Timeline items={[{ date: "2024", title: "Founded", description: "…" }, { date: "2025", title: "Series A" }]} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `{ title: string; date?: string; description?: ReactNode }[]` | — | Steps, top to bottom |

## Notes for the agent

- The preview here is short so steps light immediately; on a real page each step lights as it crosses ~55% of the viewport height.
- Needs vertical page scroll to show the progress rail filling.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
