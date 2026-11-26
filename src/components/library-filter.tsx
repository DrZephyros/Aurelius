"use client";

import { useEffect, useState, type ReactNode } from "react";
import { navigate, usePath } from "@/lib/router";
import { TEMPLATES } from "@/lib/templates";
import { CATEGORIES, KINDS, clearFilter, isActive, matchLibrary, setFilter, toggle, useLibFilter } from "@/lib/library-filter";

const SearchIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const Label = ({ children }: { children: ReactNode }) => (
  <div className="mb-3 font-mono text-[10.5px] tracking-[0.18em] text-dim uppercase">{children}</div>
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
      <span aria-hidden className={`size-1.5 rounded-full bg-aurora transition-all duration-300 ${on ? "scale-100 opacity-100" : "scale-0 opacity-0"}`} />
      {children}
      {count !== undefined && <span className={`font-mono text-[10.5px] ${on ? "text-aurora" : "text-dim"}`}>{count}</span>}
    </button>
  );
}

function SearchField({ id }: { id: string }) {
  const { q } = useLibFilter();
  return (
    <div className="group flex h-12 items-center gap-3 rounded-2xl border border-line bg-white/[0.03] pl-4 pr-2 text-aurora transition duration-300 focus-within:border-aurora/50 focus-within:bg-white/[0.05]">
      <SearchIcon />
      <input
        id={id}
        aria-label="Search the library"
        value={q}
        onChange={(e) => setFilter({ q: e.target.value })}
        placeholder="Search landing pages, app pages, elements…"
        className="h-full min-w-0 flex-1 bg-transparent text-[14.5px] text-fg outline-none placeholder:text-dim"
      />
      {q && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setFilter({ q: "" })}
          className="grid size-8 place-items-center rounded-full text-dim transition hover:bg-white/10 hover:text-fg"
        >
          ×
        </button>
      )}
    </div>
  );
}

/** Search, type toggles and category chips. Used inline on /library and inside the global dock. */
export function FilterPanel({ idPrefix = "lib" }: { idPrefix?: string }) {
  const f = useLibFilter();
  const active = isActive(f);
  const total = matchLibrary(f, TEMPLATES).total;

  return (
    <div className="space-y-7">
      <SearchField id={`${idPrefix}-search`} />

      <div>
        <Label>Type</Label>
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <Chip key={k.id} on={f.kinds.includes(k.id)} onClick={() => setFilter({ kinds: toggle(f.kinds, k.id) })}>
              {k.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <Label>Category · landing pages</Label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Chip key={c} on={f.cats.includes(c)} count={TEMPLATES.filter((t) => t.tags.includes(c)).length} onClick={() => setFilter({ cats: toggle(f.cats, c) })}>
              {c}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line pt-5">
        <span className="font-mono text-[11px] tracking-[0.14em] text-dim uppercase">{active ? `${total} matching` : "Showing everything"}</span>
        <button
          type="button"
          onClick={clearFilter}
          disabled={!active}
          className="text-[13px] text-dim transition duration-300 hover:text-fg disabled:pointer-events-none disabled:opacity-0"
        >
          Clear all
        </button>
      </div>
    </div>
  );
}

/** Floating search & filter, available on every page. Opens an animated sheet with the same filters. */
export function LibraryDock() {
  const path = usePath();
  const f = useLibFilter();
  const [open, setOpen] = useState(false);
  const active = isActive(f);
  const total = matchLibrary(f, TEMPLATES).total;

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "/" && !(e.target as HTMLElement).matches("input,textarea,[contenteditable]")) {
        e.preventDefault();
        setOpen(true);
      }
    };
    addEventListener("keydown", on);
    return () => removeEventListener("keydown", on);
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => document.getElementById("dock-search")?.focus({ preventScroll: true }), 350);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const go = () => {
    if (path !== "/library") navigate("/library");
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="glass fixed inset-x-0 bottom-5 z-30 mx-auto flex h-12 w-max items-center gap-3 rounded-full pl-4 pr-5 text-[13.5px] text-fg/90 shadow-[0_18px_50px_-18px_rgb(0_0_0/0.85)] transition duration-500 hover:-translate-y-0.5 hover:border-[rgb(92_255_196/0.5)] active:scale-95"
      >
        <span className="text-aurora"><SearchIcon /></span>
        <span>Search &amp; filter</span>
        {active && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-aurora px-1.5 font-mono text-[11px] text-[#021510]">{total}</span>}
      </button>

      <div role="dialog" aria-modal="true" aria-label="Search and filter" aria-hidden={!open} className={`fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6 ${open ? "visible" : "invisible pointer-events-none delay-500"}`}>
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Close search"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          className={`relative flex max-h-[90svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] border border-line-strong bg-[rgb(8_12_22/0.96)] shadow-[0_-30px_90px_-20px_rgb(0_0_0/0.8)] transition-all duration-500 ease-[cubic-bezier(.16,1,.3,1)] sm:rounded-[28px] ${
            open ? "translate-y-0 scale-100 opacity-100" : "translate-y-12 scale-[0.97] opacity-0"
          }`}
        >
          <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-5">
            <div>
              <div className="eyebrow">Search &amp; filter</div>
              <div className="mt-1 font-display text-[22px] font-semibold tracking-[-0.03em]">Find what you need</div>
            </div>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full border border-line text-dim transition duration-300 hover:rotate-90 hover:border-line-strong hover:text-fg">
              ×
            </button>
          </div>
          <div className="overflow-y-auto p-6">
            <FilterPanel idPrefix="dock" />
          </div>
          <div className="border-t border-line p-6">
            <button type="button" onClick={go} className="btn btn-primary w-full">
              {active ? `Show ${total} result${total === 1 ? "" : "s"}` : "Browse the library"} <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
