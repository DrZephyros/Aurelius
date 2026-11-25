---
name: Table of contents
tagline: A scroll-spy outline generated from your page's headings
tags: [docs, blog, sidebar, scroll-spy]
deps: []
order: 5
---

# Table of contents

A scroll-spy outline generated from your page's headings.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables. If something needs to change that props can't do, edit the copied file (it is yours) and keep the public props backwards compatible.

## What's in this folder

| File | Purpose |
| --- | --- |
| `table-of-contents.tsx` | the component — exports `TableOfContents` |
| `README.md` | these instructions |

## Install

1. Copy `table-of-contents.tsx` into the user's project, e.g. `components/aurelius/table-of-contents.tsx` (any folder works; adjust the import path below).
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components. It is plain TypeScript — for a JS project rename to `.jsx` and delete the type annotations.
4. Styling is self-contained: the component injects a small scoped `<style>` block (classes prefixed `au-`). **No Tailwind config, CSS file or provider is required.** Theme it with the CSS variables listed below, or the props.

## Usage

```tsx
import { TableOfContents } from "@/components/aurelius/table-of-contents";

<aside className="sticky top-24 hidden lg:block w-56">
  <TableOfContents />
</aside>
<article>…<h2>Intro</h2>…</article>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `selector` | `string` | `"h2, h3"` | Which headings to list |
| `root` | `string` | `"article"` | Container to search within |
| `title` | `string` | `"On this page"` | Label above the list |
| `offset` | `number` | `96` | Pixels reserved for a sticky header (page scroll only) |
| `updateHash` | `boolean` | `false` | Write the clicked id into the URL hash. Leave off in hash-routed apps |

## Notes for the agent

- Clicking an entry scrolls whichever element actually holds the headings — the page, or an inner `overflow:auto` article.
- Headings without an `id` get a slug id automatically.
- Runs after mount, so server HTML contains no list (fine for navigation chrome).
- If your content loads async, change `root` or remount (`key`) after it appears.
- Motion respects `prefers-reduced-motion`; keep that behaviour if you modify the animation.
- Colours default to the Aurelius aurora palette. Override globally with CSS variables on any ancestor: `--au-accent`, `--au-accent-2`, `--au-fg`, `--au-bg`, `--au-border` (each component only reads the ones it needs).
- SSR-safe: nothing touches `window`/`document` during render, so no `dynamic(..., { ssr: false })` wrapper is needed.
