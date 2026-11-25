---
name: CTA banner
tagline: A closing call-to-action card with drifting aurora light
tags: [cta, footer, conversion, landing]
deps: []
order: 9
---

# CTA banner

A closing call-to-action card with drifting aurora light.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `cta-banner.tsx` | the component — exports `CtaBanner` |
| `README.md` | these instructions |

## Install

1. Copy `cta-banner.tsx` into the user's project, e.g. `components/aurelius/cta-banner.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { CtaBanner } from "@/components/aurelius/cta-banner";

<CtaBanner title="Start building today" primary={{ label: "Sign up free", href: "/signup" }} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `ReactNode` | — | Headline |
| `description` | `ReactNode` | — | Supporting copy |
| `primary` | `{ label: string; href: string }` | — | Main button (white) |
| `secondary` | `{ label: string; href: string }` | — | Optional ghost button |

## Notes for the agent

- Place it right above the footer. Put it inside a max-width container.
- Swap the primary button for `<WaitlistForm />` by editing the file if you want inline email capture.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
