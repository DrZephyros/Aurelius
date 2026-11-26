import { useSyncExternalStore } from "react";
import { FILTERS } from "@/lib/templates";
import { ELEMENTS, PAGES, PAGE_CATEGORIES, elementsIn, familyOf, type Demo } from "@/lib/collections";
import { REG_CATS, TEXT_EFFECTS, itemsOf } from "@/lib/registry";

/* Shared library filter: the search box, type toggles and category chips. One store feeds both the
   inline panel on /library and the floating dock that is reachable from every page. */

export type LibKind = "worlds" | "pages" | "components";

export const KINDS: { id: LibKind; label: string }[] = [
  { id: "worlds", label: "Landing pages" },
  { id: "pages", label: "App pages" },
  { id: "components", label: "Components" },
];

export const CATEGORIES = FILTERS.filter((c) => c !== "All");

export const PAGE_CATS = PAGE_CATEGORIES.filter((c) => c !== "All");
export const COMPONENT_CATS = REG_CATS.filter((c) => c.slug !== TEXT_EFFECTS);

/** cats = landing-page categories · pageCats = app-page categories · compCats = component category slugs (elements included) */
export type LibFilter = { q: string; kinds: LibKind[]; cats: string[]; pageCats: string[]; compCats: string[] };
const EMPTY: LibFilter = { q: "", kinds: [], cats: [], pageCats: [], compCats: [] };

/** number of individual choices selected (search text excluded) */
export const countChoices = (f: LibFilter) => f.kinds.length + f.cats.length + f.pageCats.length + f.compCats.length;

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

export const isActive = (f: LibFilter) => f.q.trim() !== "" || countChoices(f) > 0;
export const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** Each category group narrows its own kind. With no explicit "Type", only the kinds that have a category picked are shown. */
export function matchLibrary<W extends { name: string; tagline: string; blurb: string; tags: string[]; bestFor: string[] }>(f: LibFilter, worlds: W[]) {
  const n = f.q.trim().toLowerCase();
  const has = (parts: string[]) => !n || parts.join(" ").toLowerCase().includes(n);
  const sel = { worlds: f.cats, pages: f.pageCats, components: f.compCats };
  const anySel = Object.values(sel).some((l) => l.length > 0);
  const on = (k: LibKind) => (f.kinds.length > 0 ? f.kinds.includes(k) : !anySel || sel[k].length > 0);
  const landing = on("worlds") ? worlds.filter((t) => (!f.cats.length || t.tags.some((x) => f.cats.includes(x))) && has([t.name, t.tagline, t.blurb, ...t.tags, ...t.bestFor])) : [];
  const pages = on("pages") ? PAGES.filter((d) => (!f.pageCats.length || f.pageCats.includes(d.category)) && has([d.name, d.tagline, d.blurb, d.category, ...d.features])) : [];
  const inFamily = (slug: string) => !f.compCats.length || f.compCats.includes(slug);
  const demos: Demo[] = on("components") ? ELEMENTS.filter((d) => inFamily(familyOf(d)) && has([d.name, d.tagline, d.blurb, d.category, ...d.features])) : [];
  const components = on("components") ? REG_CATS.filter((c) => c.slug !== TEXT_EFFECTS && inFamily(c.slug) && has([c.name, c.blurb, ...itemsOf(c.slug).map((i) => i.name)])) : [];
  return { worlds: landing, pages, demos, components, total: landing.length + pages.length + demos.length + components.length };
}

/** Pieces in one component family: registry items plus the element demos that belong to it. */
export const familySize = (slug: string) => itemsOf(slug).length + elementsIn(slug).length;
