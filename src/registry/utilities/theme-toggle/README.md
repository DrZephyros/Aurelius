---
name: Theme toggle
tagline: A sun/moon dark-mode switch that persists and never flashes
tags: [dark-mode, theme, header]
deps: []
order: 1
---

# Theme toggle

A sun/moon dark-mode switch that persists and never flashes.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `theme-toggle.tsx` | the component — exports `ThemeToggle` |
| `README.md` | these instructions |

## Install

1. Copy `theme-toggle.tsx` into the user's project, e.g. `components/aurelius/theme-toggle.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { ThemeToggle } from "@/components/aurelius/theme-toggle";

<ThemeToggle />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `storageKey` | `string` | `"theme"` | localStorage key |
| `mode` | `"class" \| "attribute"` | `"class"` | Toggle `dark` class on <html> (Tailwind) or set `data-theme` |
| `size` | `number` | `40` | Button size (px) |

## Notes for the agent

- Exports `themeInitScript(key, mode)`. Inject it inline in `<head>` to avoid a flash of the wrong theme (see Extras).
- For Tailwind v4 class-based dark mode add `@custom-variant dark (&:where(.dark, .dark *));` to your CSS.
- For Tailwind v3 set `darkMode: "class"`.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.

## Extras

### No-flash setup (Next.js App Router)

```tsx
// app/layout.tsx
import { themeInitScript } from "@/components/aurelius/theme-toggle";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInitScript() }} /></head>
      <body>{children}</body>
    </html>
  );
}
```
