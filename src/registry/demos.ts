import { lazy, type ComponentType } from "react";

/* Every component folder ships a demo.tsx (site preview only). They are code-split and loaded on demand. */
const mods = import.meta.glob("./*/*/demo.tsx") as Record<string, () => Promise<{ default: ComponentType }>>;

export const DEMOS: Record<string, ComponentType> = Object.fromEntries(
  Object.entries(mods).map(([k, load]) => [k.replace(/^\.\//, "").replace(/\/demo\.tsx$/, ""), lazy(load)])
);
