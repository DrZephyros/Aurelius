"use client";

import { Link } from "@/lib/router";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { FILTERS, type Template } from "@/lib/templates";
import { downloadTemplate } from "@/lib/files";
import { SITE } from "@/lib/site";
import { LivePreview } from "./live-preview";
import { ScrubSurface } from "./scrub";

export type GalleryItem = Template & { tokens: number; downloads: number };

const GPU_DOT: Record<string, string> = { Light: "#7dffb0", Medium: "#ffd34d", Heavy: "#ff7a59" };

/** A card that looks like the website it opens: browser frame, the live site inside it,
 *  and a clear "Open" affordance. Moving the cursor across the preview scrubs through the site. */
export function TemplateCard({ t, index }: { t: GalleryItem; index: number }) {
  return (
    <article className="tcard panel spot group overflow-hidden !rounded-[24px]" style={{ "--c": t.accent } as CSSProperties}>
      <Link href={`/templates/${t.slug}`} className="block cursor-pointer" aria-label={`Open the ${t.name} live preview`}>
        {/* browser chrome */}
        <div className="flex items-center gap-3 border-b border-line bg-black/40 px-4 py-2.5">
          <div className="flex gap-1.5">
            <i className="size-2 rounded-full bg-white/15" />
            <i className="size-2 rounded-full bg-white/15" />
            <i className="size-2 rounded-full bg-white/15" />
          </div>
          <div className="min-w-0 flex-1 truncate rounded-full border border-line bg-black/30 px-3 py-1 text-center font-mono text-[10.5px] text-dim">
            {SITE.domain}/demo/{t.slug}
          </div>
          <span className="flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.18em] text-dim uppercase">
            <span className="size-1.5 rounded-full" style={{ background: t.accent, animation: "pulse-dot 1.6s infinite" }} />
            Live
          </span>
        </div>

        {/* the site itself */}
        <ScrubSurface accent={t.accent}>
          {({ frameRef, onLoad }) => (
            <>
              <LivePreview slug={t.slug} accent={t.accent} bg={t.bg} name={t.name} frameRef={frameRef} onFrameLoad={onLoad} />
              <span className="chip pointer-events-none absolute left-3 top-3 !bg-black/55 backdrop-blur-md">N°{String(index + 1).padStart(2, "0")}</span>
              <span className="chip pointer-events-none absolute right-3 top-3 !bg-black/55 backdrop-blur-md">
                <i className="size-1.5 rounded-full" style={{ background: GPU_DOT[t.gpu] }} /> {t.gpu} GPU
              </span>
              {/* hover affordance: tells you exactly what a click does */}
              <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold text-black shadow-2xl">
                  Open interactive preview
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 17 17 7M8 7h9v9" /></svg>
                </span>
              </div>
            </>
          )}
        </ScrubSurface>

        <div className="px-5 pt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-[22px] font-semibold tracking-[-0.03em]">{t.name}</h3>
              <p className="mt-0.5 text-sm text-dim">{t.tagline}</p>
            </div>
            <span className="mt-1.5 shrink-0 font-mono text-[11px] text-dim" title="Downloads">↓ {t.downloads.toLocaleString()}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {t.tags.slice(0, 3).map((x) => (
              <span key={x} className="chip">{x}</span>
            ))}
            <span className="chip">{t.theme}</span>
          </div>
        </div>
      </Link>

      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2 px-5 pb-5">
        <Link href={`/templates/${t.slug}`} className="btn btn-ghost btn-sm">Open preview · prompts · code</Link>
        <button type="button" onClick={() => void downloadTemplate(t)} className="btn btn-primary btn-sm" aria-label={`Download ${t.name}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M12 3v13m0 0 5-5m-5 5-5-5M4 21h16" /></svg>
          .zip
        </button>
      </div>
    </article>
  );
}

export function Gallery({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");
  useEffect(() => {
    const on = (e: Event) => {
      const f = (e as CustomEvent<string>).detail;
      if ((FILTERS as readonly string[]).includes(f)) setFilter(f as (typeof FILTERS)[number]);
    };
    window.addEventListener("aurelius:filter", on);
    return () => window.removeEventListener("aurelius:filter", on);
  }, []);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((t) => {
      if (filter !== "All" && !t.tags.includes(filter)) return false;
      if (!needle) return true;
      return [t.name, t.tagline, t.blurb, ...t.tags, ...t.bestFor].join(" ").toLowerCase().includes(needle);
    });
  }, [items, filter, q]);

  return (
    <div>
      <div className="flex flex-col gap-4">
        <label className="relative block w-full md:max-w-md">
          <span className="sr-only">Search templates</span>
          <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dim" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: restaurant, portfolio, dark…"
            className="h-11 w-full rounded-full border border-line bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition placeholder:text-dim/70 focus:border-aurora/60"
          />
        </label>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:px-0" role="tablist" aria-label="Filter templates">
          {FILTERS.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full border px-4 py-2 text-[13px] transition ${
                filter === f ? "border-aurora bg-aurora text-[#021510]" : "border-line text-dim hover:border-line-strong hover:text-fg"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-5 font-mono text-[11px] tracking-[0.14em] text-dim uppercase">
        {shown.length} / {items.length} templates · move your cursor across a card to glide through the site · click to open
      </p>

      {shown.length === 0 ? (
        <div className="panel mt-8 p-12 text-center text-dim">
          Nothing matches “{q}”.{" "}
          <button className="text-aurora underline" onClick={() => { setQ(""); setFilter("All"); }}>Reset filters</button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((t) => (
            <TemplateCard key={t.slug} t={t} index={items.findIndex((x) => x.slug === t.slug)} />
          ))}
        </div>
      )}
    </div>
  );
}
