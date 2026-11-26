---
name: Cookie banner
tagline: A tasteful consent bar that remembers the visitor's choice
tags: [legal, gdpr, privacy, utility]
deps: []
order: 4
---

# Cookie banner

A tasteful consent bar that remembers the visitor's choice.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `cookie-banner.tsx` | the component — exports `CookieBanner` |
| `README.md` | these instructions |

## Install

1. Copy `cookie-banner.tsx` into the user's project, e.g. `components/aurelius/cookie-banner.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { CookieBanner } from "@/components/aurelius/cookie-banner";

// app/layout.tsx
<CookieBanner policyHref="/privacy" onChoice={(c) => c === "accepted" && loadAnalytics()} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `message` | `string` | `friendly default` | Banner copy |
| `policyHref` | `string` | `"/privacy"` | Link to your privacy policy |
| `storageKey` | `string` | `"au-cookie-consent"` | localStorage key |
| `onChoice` | `(c: "accepted" \| "rejected") => void` | — | Fires on load (if a choice exists) and on click — start analytics here |

## Notes for the agent

- It does not block scripts by itself — gate your analytics on `onChoice` / `getConsent()`.
- Exports `getConsent()` for non-React code.
- You still need a real privacy policy page; this is only the UI.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
