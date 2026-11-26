"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { TEMPLATES } from "@/lib/templates";
import { PAGES } from "@/lib/collections";
import {
  CATEGORIES, COMPONENT_CATS, KINDS, PAGE_CATS, familySize,
  clearFilter, countChoices, isActive, matchLibrary, setFilter, toggle, useLibFilter,
  type LibFilter,
} from "@/lib/library-filter";

const SearchIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const FilterIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);

function Chip({ on, onClick, count, children }: { on: boolean; onClick: () => void; count?: number; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] transition-all duration-300 ease-out active:scale-95 ${
        on
          ? "border-aurora/60 bg-aurora/10 text-fg shadow-[0_0_24px_-8px_rgb(92_255_196/0.55)]"
          : "border-line text-dim hover:border-line-strong hover:text-fg"
      }`}
    >
      <span aria-hidden className={`size-1.5 rounded-full bg-aurora transition-all duration-300 ${on ? "scale-100 opacity-100" : "hidden"}`} />
      {children}
      {count !== undefined && <span className={`font-mono text-[10.5px] ${on ? "text-aurora" : "text-dim"}`}>{count}</span>}
    </button>
  );
}

type Group = { id: string; label: string; hint: string; selected: number; chips: { key: string; label: string; count?: number; on: boolean; toggle: () => void }[] };

function groupsOf(f: LibFilter): Group[] {
  return [
    {
      id: "type", label: "Type", hint: "What kind of thing", selected: f.kinds.length,
      chips: KINDS.map((k) => ({ key: k.id, label: k.label, on: f.kinds.includes(k.id), toggle: () => setFilter({ kinds: toggle(f.kinds, k.id) }) })),
    },
    {
      id: "landing", label: "Landing page industry", hint: "Portfolio, SaaS, Travel…", selected: f.cats.length,
      chips: CATEGORIES.map((c) => ({ key: c, label: c, count: TEMPLATES.filter((t) => t.tags.includes(c)).length, on: f.cats.includes(c), toggle: () => setFilter({ cats: toggle(f.cats, c) }) })),
    },
    {
      id: "pages", label: "App page type", hint: "Auth, commerce, utility…", selected: f.pageCats.length,
      chips: PAGE_CATS.map((c) => ({ key: c, label: c, count: PAGES.filter((d) => d.category === c).length, on: f.pageCats.includes(c), toggle: () => setFilter({ pageCats: toggle(f.pageCats, c) }) })),
    },
    {
      id: "components", label: "Component family", hint: "Sections, forms, overlays…", selected: f.compCats.length,
      chips: COMPONENT_CATS.map((c) => ({ key: c.slug, label: c.name, count: familySize(c.slug), on: f.compCats.includes(c.slug), toggle: () => setFilter({ compCats: toggle(f.compCats, c.slug) }) })),
    },
  ];
}

/** Search bar (black) with a filter button; the button opens a dropdown of filter categories. */
export function FilterPanel({ idPrefix = "lib" }: { idPrefix?: string }) {
  const f = useLibFilter();
  const active = isActive(f);
  const choices = countChoices(f);
  const total = useMemo(() => matchLibrary(f, TEMPLATES).total, [f]);
  const groups = groupsOf(f);
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState("type");
  const wrap = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    addEventListener("pointerdown", down);
    addEventListener("keydown", key);
    return () => { removeEventListener("pointerdown", down); removeEventListener("keydown", key); };
  }, [open]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target as HTMLElement).matches("input,textarea,[contenteditable]")) { e.preventDefault(); input.current?.focus(); }
    };
    addEventListener("keydown", on);
    return () => removeEventListener("keydown", on);
  }, []);

  const picked = groups.flatMap((g) => g.chips.filter((c) => c.on).map((c) => ({ ...c, group: g.label })));

  return (
    <div className="space-y-4">
      <div ref={wrap} className="relative z-30 max-w-[720px]">
        <div className="flex items-center gap-3">
          <div className="group flex h-12 min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-black pl-4 pr-2 text-aurora transition duration-300 focus-within:border-aurora/50">
            <SearchIcon />
            <input
              ref={input}
              id={`${idPrefix}-search`}
              aria-label="Search the library"
              value={f.q}
              onChange={(e) => setFilter({ q: e.target.value })}
              placeholder="Search landing pages, app pages, components…"
              className="h-full min-w-0 flex-1 bg-transparent text-[14.5px] text-fg outline-none placeholder:text-dim"
            />
            {f.q ? (
              <button type="button" aria-label="Clear search" onClick={() => { setFilter({ q: "" }); input.current?.focus(); }} className="grid size-8 place-items-center rounded-full text-dim transition hover:bg-white/10 hover:text-fg">×</button>
            ) : (
              <kbd className="pointer-events-none mr-1 hidden rounded-md border border-line-strong px-2 py-0.5 font-mono text-[11px] text-dim sm:block">/</kbd>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={open}
            aria-label={choices ? `Filters, ${choices} selected` : "Filters"}
            className={`relative grid size-12 shrink-0 place-items-center rounded-2xl border bg-black transition duration-300 active:scale-95 ${open || choices ? "border-aurora/60 text-aurora" : "border-white/10 text-fg/80 hover:border-white/25 hover:text-fg"}`}
          >
            <FilterIcon />
            {choices > 0 && <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-aurora px-1 font-mono text-[10.5px] font-medium text-[#021510]">{choices}</span>}
          </button>
        </div>

        <div
          role="dialog"
          aria-label="Filters"
          className={`absolute right-0 top-full z-40 mt-3 w-full origin-top-right overflow-hidden rounded-[22px] border border-white/12 bg-black shadow-[0_30px_80px_-20px_rgb(0_0_0/0.95)] transition duration-300 ease-[cubic-bezier(.16,1,.3,1)] sm:w-[480px] ${open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-[0.98] opacity-0"}`}
        >
          <div aria-hidden className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-aurora/60 to-transparent" />
          <div className="max-h-[min(70svh,520px)] overflow-y-auto p-2">
            {groups.map((g) => {
              const isOpen = group === g.id;
              return (
                <div key={g.id} className="rounded-2xl">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    tabIndex={open ? 0 : -1}
                    onClick={() => setGroup(isOpen ? "" : g.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition duration-300 hover:bg-white/[0.05] ${isOpen ? "bg-white/[0.04]" : ""}`}
                  >
                    <span>
                      <span className="block text-[14px] font-medium text-fg">{g.label}</span>
                      <span className="block text-[12px] text-dim">{g.hint}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      {g.selected > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-aurora/15 px-1.5 font-mono text-[10.5px] text-aurora">{g.selected}</span>}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`text-dim transition duration-300 ${isOpen ? "rotate-180" : ""}`} aria-hidden><path d="m6 9 6 6 6-6" /></svg>
                    </span>
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <div className="overflow-hidden">
                      <div className="flex flex-wrap gap-2 px-4 pb-4 pt-3">
                        {g.chips.map((c) => (
                          <Chip key={c.key} on={c.on} count={c.count} onClick={c.toggle}>{c.label}</Chip>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-3.5">
            <span className="font-mono text-[11px] tracking-[0.14em] text-dim uppercase">{active ? `${total} matching` : "Showing everything"}</span>
            <div className="flex items-center gap-4">
              <button type="button" onClick={clearFilter} disabled={!active} className="text-[13px] text-dim transition duration-300 hover:text-fg disabled:pointer-events-none disabled:opacity-30">Clear all</button>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-aurora px-4 py-1.5 text-[13px] font-medium text-[#021510] transition active:scale-95">Done</button>
            </div>
          </div>
        </div>
      </div>

      {(picked.length > 0 || active) && (
        <div className="flex flex-wrap items-center gap-2">
          {picked.map((c) => (
            <button key={`${c.group}-${c.key}`} type="button" onClick={c.toggle} aria-label={`Remove filter ${c.label}`} className="group inline-flex items-center gap-2 rounded-full border border-aurora/40 bg-aurora/10 py-1.5 pl-3.5 pr-2.5 text-[12.5px] text-fg transition hover:border-aurora">
              {c.label}<span aria-hidden className="text-dim transition group-hover:text-fg">×</span>
            </button>
          ))}
          {active && <button type="button" onClick={clearFilter} className="px-2 text-[12.5px] text-dim transition hover:text-fg">Clear all</button>}
        </div>
      )}
    </div>
  );
}
