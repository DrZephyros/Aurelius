---
name: Smart navbar
tagline: A header that hides on scroll-down, returns on scroll-up and frosts over the page
tags: [header, nav, responsive, glass]
deps: []
order: 3
---

# Smart navbar

A header that hides on scroll-down, returns on scroll-up and frosts over the page.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `smart-navbar.tsx` | the component — exports `SmartNavbar` |
| `README.md` | these instructions |

## Install

1. Copy `smart-navbar.tsx` into the user's project, e.g. `components/aurelius/smart-navbar.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { SmartNavbar } from "@/components/aurelius/smart-navbar";

<SmartNavbar
  logo="Acme"
  links={[{ label: "Pricing", href: "#pricing" }]}
  cta={{ label: "Sign up", href: "/signup" }}
/>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `logo` | `ReactNode` | — | Brand mark / text (links to /) |
| `links` | `{ label: string; href: string }[]` | — | Main links |
| `cta` | `{ label: string; href: string }` | — | Optional primary button |
| `hideAfter` | `number` | `120` | Scroll distance before hide-on-scroll-down kicks in |

## Notes for the agent

- It is `position: fixed` — add top padding (~64px) to your first section.
- Includes a mobile menu (≤760px). For Next.js client-side navigation, swap the `<a>` tags for `next/link`.
- Shows again whenever the mobile menu is open.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
