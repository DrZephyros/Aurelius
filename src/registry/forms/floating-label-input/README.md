---
name: Floating label input
tagline: A text field with a floating label, focus ring, hint and error state
tags: [form, input, accessible, validation]
deps: []
order: 1
---

# Floating label input

A text field with a floating label, focus ring, hint and error state.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `floating-label-input.tsx` | the component — exports `FloatingLabelInput` |
| `README.md` | these instructions |

## Install

1. Copy `floating-label-input.tsx` into the user's project, e.g. `components/aurelius/floating-label-input.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { FloatingLabelInput } from "@/components/aurelius/floating-label-input";

<FloatingLabelInput label="Email" type="email" name="email" required error={errors.email} />
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | — | Floating label text |
| `error` | `string` | — | Error message (red state, role=alert) |
| `hint` | `string` | — | Helper text |
| `...input props` | `InputHTMLAttributes` | — | type, name, value, onChange, required, autoComplete… |

## Notes for the agent

- Label association, `aria-invalid` and `aria-describedby` are handled for you.
- Works controlled or uncontrolled. The float trick uses `:placeholder-shown`, so don't pass your own `placeholder`.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
