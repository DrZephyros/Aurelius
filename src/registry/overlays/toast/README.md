---
name: Toasts
tagline: A toast system: provider + useToast() hook, with progress bar and pause on hover
tags: [notifications, feedback, hook]
deps: []
order: 2
---

# Toasts

A toast system: provider + useToast() hook, with progress bar and pause on hover.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `toast.tsx` | the component — exports `ToastProvider` |
| `README.md` | these instructions |

## Install

1. Copy `toast.tsx` into the user's project, e.g. `components/aurelius/toast.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { ToastProvider } from "@/components/aurelius/toast";

// app/layout.tsx
import { ToastProvider } from "@/components/aurelius/toast";
<body><ToastProvider>{children}</ToastProvider></body>

// anywhere in a client component
const toast = useToast();
toast({ title: "Saved", type: "success" });
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `ToastProvider children` | `ReactNode` | — | Wrap your app once |
| `toast({ title, description?, type?, duration? })` | `function` | — | From `useToast()`. type: info \| success \| error; duration ms (0 = sticky, default 4000) |

## Notes for the agent

- Exports `ToastProvider` and `useToast`. Keeps at most 4 toasts visible.
- `useToast` must be called from a client component below the provider.
- Error toasts use `role=alert`; others `role=status` inside an `aria-live` region.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
