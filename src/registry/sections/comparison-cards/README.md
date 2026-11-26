---
name: Comparison cards
tagline: Three side-by-side cards that set a generic option against a better one
tags: [comparison, before-after, pricing, landing, conversion]
deps: []
order: 10
---

# Comparison cards

Three numbered cards. Each one names a point of comparison and shows two plain lines: the generic option, and the better one.

> **For the coding agent:** this folder is a self-contained, drop-in React component. Follow "Install", then "Usage". Do not rewrite the component — configure it with props and CSS variables.

## What's in this folder

| File | Purpose |
| --- | --- |
| `comparison-cards.tsx` | the component — exports `ComparisonCards` |
| `README.md` | these instructions |

## Install

1. Copy `comparison-cards.tsx` into the user's project, e.g. `components/aurelius/comparison-cards.tsx`.
2. npm dependencies: none. Requires React 18.2+ (React 19 / Next.js 15+ recommended).
3. The file starts with `"use client"`, so it can be imported from Next.js App Router server components.
4. Styling is self-contained: the component injects a scoped `<style>` block (classes prefixed `au-cc`). Accent colour comes from `--au-accent`.

## Usage

```tsx
import { ComparisonCards } from "@/components/aurelius/comparison-cards";

<ComparisonCards
  eyebrow="The difference"
  title="Same request. Different result."
  labels={["Just an AI", "With AURA"]}
  rows={[
    { title: "Looks", before: "Like every other AI site.", after: "Custom 3D, made for your brand." },
    { title: "Your time", before: "Hours of back and forth.", after: "One prompt. Done." },
  ]}
/>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rows` | `{ title, before, after }[]` | — | One card per row. `before` is the generic option, `after` the better one. |
| `eyebrow` | `string` | — | Small label above the title. |
| `title` | `ReactNode` | — | Heading. |
| `labels` | `[string, string]` | `["Generic", "Better"]` | Labels for the two lines in each card. |
| `className` / `style` | — | — | Applied to the outer section. |
