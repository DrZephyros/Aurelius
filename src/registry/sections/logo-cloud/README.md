---
name: Logo cloud
tagline: A "trusted by" strip — grayscale logos that scroll and light up on hover
tags: [social-proof, logos, landing]
deps: []
order: 6
---

# Logo cloud

A "trusted by" strip — grayscale logos that scroll and light up on hover.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `logo-cloud.tsx` | the component — exports `LogoCloud` |
| `README.md` | these instructions |

## Install

1. Copy `logo-cloud.tsx` into the user's project, e.g. `components/aurelius/logo-cloud.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { LogoCloud } from "@/components/aurelius/logo-cloud";

<LogoCloud logos={[{ name: "Acme", src: "/logos/acme.svg" }, { name: "Globex", src: "/logos/globex.svg" }]} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `logos` | `{ name: string; src?: string; href?: string }[]` | — | Use `src` for SVG/PNG logos; omit it for text wordmarks |
| `title` | `string` | `"Trusted by teams at"` | Caption above (empty string hides it) |
| `duration` | `number` | `40` | Seconds per loop |

## Notes for the agent

- Use single-colour white/neutral SVG logos on dark pages. The component desaturates them anyway.
- Never use logos of companies that are not actually customers.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
