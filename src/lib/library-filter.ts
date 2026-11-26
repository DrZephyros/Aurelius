import { useSyncExternalStore } from "react";
import { FILTERS } from "@/lib/templates";
import { ELEMENTS, PAGES } from "@/lib/collections";
import { REG_CATS, TEXT_EFFECTS, itemsOf } from "@/lib/registry";

/* Shared library filter: the search box, type toggles and category chips. One store feeds both the
   inline panel on /library and the floating dock that is reachable from every page. */

export type LibKind = "worlds" | "pages" | "elements" | "components";

export const KINDS: { id: LibKind; label: string }[] = [
  { id: "worlds", label: "Landing pages" },
  { id: "pages", label: "App pages" },
  { id: "elements", label: "Elements" },
  { id: "components", label: "Components" },
];

export const CATEGORIES = FILTERS.filter((c) => c !== "All");

export type LibFilter = { q: string; kinds: LibKind[]; cats: string[] };
const EMPTY: LibFilter = { q: "", kinds: [], cats: [] };

let state: LibFilter = EMPTY;
const subs = new Set<() => void>();
const subscribe = (fn: () => void) => {
  subs.add(fn);
  return () => void subs.delete(fn);
};

export const setFilter = (patch: Partial<LibFilter>) => {
  state = { ...state, ...patch };
  subs.forEach((fn) => fn());
};
export const clearFilter = () => setFilter(EMPTY);
export const useLibFilter = () => useSyncExternalStore(subscribe, () => state, () => EMPTY);

export const isActive = (f: LibFilter) => f.q.trim() !== "" || f.kinds.length > 0 || f.cats.length > 0;
export const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** Landing pages carry the category tags; app pages, elements and components do not, so a category filter narrows to landing pages. */
export function matchLibrary<W extends { name: string; tagline: string; blurb: string; tags: string[]; bestFor: string[] }>(f: LibFilter, worlds: W[]) {
  const n = f.q.trim().toLowerCase();
  const has = (parts: string[]) => !n || parts.join(" ").toLowerCase().includes(n);
  const on = (k: LibKind) => f.kinds.length === 0 || f.kinds.includes(k);
  const byCat = f.cats.length > 0;
  const landing = on("worlds") ? worlds.filter((t) => (!byCat || t.tags.some((x) => f.cats.includes(x))) && has([t.name, t.tagline, t.blurb, ...t.tags, ...t.bestFor])) : [];
  const pages = on("pages") && !byCat ? PAGES.filter((d) => has([d.name, d.tagline, d.blurb, d.category, ...d.features])) : [];
  const elements = on("elements") && !byCat ? ELEMENTS.filter((d) => has([d.name, d.tagline, d.blurb, d.category, ...d.features])) : [];
  const components = on("components") && !byCat ? REG_CATS.filter((c) => c.slug !== TEXT_EFFECTS && has([c.name, c.blurb, ...itemsOf(c.slug).map((i) => i.name)])) : [];
  return { worlds: landing, pages, elements, components, total: landing.length + pages.length + elements.length + components.length };
}
