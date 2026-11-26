"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "@/lib/router";
import { TEMPLATES } from "@/lib/templates";
import { ELEMENTS, PAGES, PAGE_CATEGORIES, type Demo } from "@/lib/collections";
import { ALL_PROMPTS } from "@/lib/library";
import { REG_CATS, REG_ITEMS, TEXT_EFFECTS, catHref, itemHref, itemsOf } from "@/lib/registry";
import { CAT_COLORS, DemoStage } from "@/components/registry/registry-ui";
import { metricsFor } from "@/lib/files";
import { getStats } from "@/lib/stats";
import { BUNDLES } from "@/bundles/data";
import { Gallery, TemplateCard, type GalleryItem } from "@/components/gallery";
import { DemoCard } from "@/components/demo-frame";
import { Reveal } from "@/components/reveal";
import { AgentLink } from "@/components/agent-link";
import { TIERS } from "@/lib/site";
import { FilterPanel } from "@/components/library-filter";
import { familySize, isActive, matchLibrary, useLibFilter } from "@/lib/library-filter";

export type Shelf = "all" | "worlds" | "pages";

const COPY: Record<Shelf, { eyebrow: string; title: ReactNode; body: string }> = {
  all: {
    eyebrow: "The library",
    title: <>Pick one. <span className="aurora-text">Poke it.</span></>,
    body: "Free, forever. Every card is the real thing, running — glide over one to scrub it, click to step inside, read the source and take the code. Or issue an agent link and let your AI browse it for you.",
  },
  worlds: {
    eyebrow: "Landing pages",
    title: <>Landing pages that <span className="aurora-text">stop the scroll.</span></>,
    body: "Cinematic, scroll-driven 3D websites built to do a landing page's job: say what it is, earn trust, get the click. Glide over a card to scrub the page; click to open it full-size.",
  },
  pages: {
    eyebrow: "App pages",
    title: <>The screens every product needs, <span className="aurora-text">finished.</span></>,
    body: "Sign in, booking, inbox, invoices, status, checkout, dashboards — each one a single HTML file with real validation, real states and real motion. Hover a card and the page reacts to you.",
  },
};

const worldItems = (): GalleryItem[] => {
  const stats = getStats();
  return TEMPLATES.map((t) => ({ ...t, tokens: metricsFor(t.slug).tokens, downloads: stats[t.slug]?.downloads ?? 0 }));
};

const Search = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target as HTMLElement).matches("input,textarea")) { e.preventDefault(); ref.current?.focus(); }
    };
    addEventListener("keydown", on);
    return () => removeEventListener("keydown", on);
  }, []);
  return (
    <label className="glass relative block h-12 w-full max-w-[460px] rounded-full">
      <span className="sr-only">Search the library</span>
      <svg className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-aurora" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input ref={ref} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-full w-full rounded-full bg-transparent pl-12 pr-14 text-[14.5px] outline-none placeholder:text-dim" />
      <kbd className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded-md border border-line-strong px-2 py-0.5 font-mono text-[11px] text-dim">/</kbd>
    </label>
  );
};

function SectionHead({ id, n, title, count, unit, href, accent }: { id: string; n: string; title: string; count: number; unit: string; href: string; accent: string }) {
  return (
    <div id={id} className="mb-6 flex flex-wrap items-end justify-between gap-4 scroll-mt-32">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-xs tracking-[0.2em]" style={{ color: accent }}>{n}</span>
        <h2 className="font-display text-[clamp(1.7rem,3vw,2.5rem)] font-semibold tracking-[-0.04em]">{title}</h2>
        <span className="font-mono text-[11px] tracking-[0.14em] text-dim uppercase">{count} {unit}</span>
      </div>
      <Link href={href} className="group flex items-center gap-2 text-[13px] text-dim transition hover:text-fg">
        View all {count} <span className="transition group-hover:translate-x-1" aria-hidden>→</span>
      </Link>
    </div>
  );
}

function DemoShelf({ list, cats, placeholder }: { list: Demo[]; cats: readonly string[]; placeholder: string }) {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return list.filter((d) => (cat === "All" || d.category === cat) && (!n || [d.name, d.tagline, d.blurb, d.category, ...d.features].join(" ").toLowerCase().includes(n)));
  }, [list, cat, q]);
  return (
    <div>
      <div className="flex flex-col gap-4">
        <Search value={q} onChange={setQ} placeholder={placeholder} />
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:mx-0 lg:px-0" role="tablist">
          {cats.map((f) => (
            <button key={f} role="tab" aria-selected={cat === f} onClick={() => setCat(f)} className={`shrink-0 rounded-full border px-4 py-2 text-[13px] transition ${cat === f ? "border-aurora bg-aurora text-[#021510]" : "border-line text-dim hover:border-line-strong hover:text-fg"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-5 font-mono text-[11px] tracking-[0.14em] text-dim uppercase">{shown.length} / {list.length} · glide across a card to bring it to life</p>
      {shown.length === 0 ? (
        <div className="panel mt-8 p-12 text-center text-dim">Nothing matches “{q}”. <button className="text-aurora underline" onClick={() => { setQ(""); setCat("All"); }}>Reset</button></div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((d, i) => (
            <Reveal key={d.slug} delay={(i % 3) * 70}><DemoCard demo={d} index={list.findIndex((x) => x.slug === d.slug)} /></Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultGroup({ title, n, children }: { title: string; n: number; children: ReactNode }) {
  return (
    <section>
      <div className="mb-6 flex items-baseline gap-4">
        <h2 className="font-display text-[clamp(1.5rem,2.6vw,2.1rem)] font-semibold tracking-[-0.04em]">{title}</h2>
        <span className="font-mono text-[11px] tracking-[0.14em] text-dim uppercase">{n}</span>
      </div>
      {children}
    </section>
  );
}

/** "All" shelf: one filter over everything, or — when idle — three tidy sections. */
function Overview() {
  const worlds = useMemo(worldItems, []);
  const f = useLibFilter();
  const active = isActive(f);
  const hits = useMemo(() => (active ? matchLibrary(f, worlds) : null), [f, active, worlds]);
  const grid = "grid gap-5 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div>
      <FilterPanel />

      {hits ? (
        <div className="mt-10 space-y-16">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="font-mono text-[11px] tracking-[0.14em] text-dim uppercase">
              {hits.total} {hits.total === 1 ? "result" : "results"}
              {f.q.trim() && <> for “{f.q.trim()}”</>}
            </p>
          </div>
          {hits.total === 0 && <div className="panel p-12 text-center text-dim">Nothing matches. Try “dark”, “login” or “menu”.</div>}
          {hits.worlds.length > 0 && (
            <ResultGroup title="Landing pages" n={hits.worlds.length}>
              <div className={grid}>{hits.worlds.map((t) => <TemplateCard key={t.slug} t={t} index={worlds.findIndex((x) => x.slug === t.slug)} />)}</div>
            </ResultGroup>
          )}
          {hits.pages.length > 0 && (
            <ResultGroup title="App pages" n={hits.pages.length}>
              <div className={grid}>{hits.pages.map((d) => <DemoCard key={d.slug} demo={d} index={PAGES.indexOf(d)} />)}</div>
            </ResultGroup>
          )}
          {hits.components.length + hits.demos.length > 0 && (
            <ResultGroup title="Components" n={hits.components.length + hits.demos.length}>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {hits.components.map((c, i) => (
                  <Link key={c.slug} href={catHref(c.slug)} className="panel group block overflow-hidden !rounded-[22px] transition duration-500 hover:-translate-y-1 hover:border-line-strong">
                    <div className="pointer-events-none"><DemoStage id={`${c.slug}/${itemsOf(c.slug)[0].slug}`} /></div>
                    <div className="p-4"><div className="font-display text-[17px] font-semibold tracking-[-0.03em]" style={{ color: CAT_COLORS[i % CAT_COLORS.length] }}>{c.name}</div><div className="mt-1 font-mono text-[10.5px] tracking-[0.14em] text-dim uppercase">{familySize(c.slug)} components</div></div>
                  </Link>
                ))}
                {hits.demos.map((d) => <DemoCard key={d.slug} demo={d} index={ELEMENTS.indexOf(d)} />)}
              </div>
            </ResultGroup>
          )}
        </div>
      ) : (
        <>
          <section className="mt-10">
            <SectionHead id="sec-worlds" n="01" title="Landing pages" count={TEMPLATES.length} unit="3D worlds" href="/landing-pages" accent="#5cffc4" />
            <div className={grid}>
              {worlds.slice(0, 6).map((t, i) => <Reveal key={t.slug} delay={(i % 3) * 70}><TemplateCard t={t} index={i} /></Reveal>)}
            </div>
            <Link href="/landing-pages" className="btn btn-ghost mt-7 w-full sm:w-auto">See all {TEMPLATES.length} landing pages <span aria-hidden>→</span></Link>
          </section>

          <section className="mt-24">
            <SectionHead id="sec-pages" n="02" title="App pages" count={PAGES.length} unit="screens" href="/pages" accent="#3de7ff" />
            <div className={grid}>
              {PAGES.slice(0, 6).map((d, i) => <Reveal key={d.slug} delay={(i % 3) * 70}><DemoCard demo={d} index={i} /></Reveal>)}
            </div>
            <Link href="/pages" className="btn btn-ghost mt-7 w-full sm:w-auto">See all {PAGES.length} app pages <span aria-hidden>→</span></Link>
          </section>

          <section className="mt-24">
            <SectionHead id="sec-components" n="03" title="Components" count={REG_ITEMS.filter((i) => i.category !== TEXT_EFFECTS).length + ELEMENTS.length} unit="drop-in React pieces" href="/components" accent="#ff7ad9" />
            <p className="-mt-3 mb-6 max-w-2xl text-[14.5px] leading-relaxed text-dim">One file each, zero dependencies, and a README written for your coding agent. Download a folder, hand it over, done.</p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {REG_CATS.filter((c) => c.slug !== TEXT_EFFECTS).slice(0, 8).map((c, i) => (
                <Reveal key={c.slug} delay={(i % 4) * 60}>
                  <Link href={catHref(c.slug)} className="panel group block overflow-hidden !rounded-[22px] transition duration-500 hover:-translate-y-1 hover:border-line-strong">
                    <div className="pointer-events-none"><DemoStage id={`${c.slug}/${itemsOf(c.slug)[0].slug}`} /></div>
                    <div className="p-4"><div className="font-display text-[17px] font-semibold tracking-[-0.03em]" style={{ color: CAT_COLORS[i % CAT_COLORS.length] }}>{c.name}</div><div className="mt-1 font-mono text-[10.5px] tracking-[0.14em] text-dim uppercase">{familySize(c.slug)} components</div></div>
                  </Link>
                </Reveal>
              ))}
            </div>
            <Link href="/components" className="btn btn-ghost mt-7 w-full sm:w-auto">Browse all components <span aria-hidden>→</span></Link>
          </section>

          <section className="mt-24">
            <SectionHead id="sec-text" n="04" title="Text effects" count={itemsOf(TEXT_EFFECTS).length} unit="import onto any text" href="/text-effects" accent="#ffd28a" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {itemsOf(TEXT_EFFECTS).slice(0, 6).map((it, i) => (
                <Reveal key={it.slug} delay={(i % 3) * 60}>
                  <Link href={itemHref(it.category, it.slug)} className="panel group block overflow-hidden !rounded-[22px] transition duration-500 hover:-translate-y-1 hover:border-line-strong">
                    <div className="pointer-events-none"><DemoStage id={`${it.category}/${it.slug}`} /></div>
                    <div className="p-4"><div className="font-display text-[17px] font-semibold tracking-[-0.03em]">{it.name}</div><div className="mt-1 text-[13px] text-dim">{it.tagline}</div></div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>

          <section className="mt-24 grid gap-4 md:grid-cols-2">
            {([
              ["/prompts", "Prompts", `${ALL_PROMPTS.length} fill-in-the-blank prompts`, "Make Claude Code, Cursor, Lovable and friends behave. Search, favourite, copy.", "#ff7ad9"],
              ["/bundles", "Bundles", `${BUNDLES.length} immersive 3D sites`, "One theme end to end: a scroll-driven WebGL landing page plus the pricing, sign-in, reservation and account pages that match it.", "#ffd28a"],
            ] as const).map(([h, t, c, d, a]) => (
              <Reveal key={h}>
                <Link href={h} className="glass spot group flex h-full items-center justify-between gap-6 rounded-[26px] p-7 transition duration-500 hover:-translate-y-1" style={{ "--c": a } as CSSProperties}>
                  <div>
                    <div className="font-mono text-[11px] tracking-[0.16em] uppercase" style={{ color: a }}>{c}</div>
                    <h3 className="mt-2 font-display text-[1.7rem] font-semibold tracking-[-0.04em]">{t}</h3>
                    <p className="mt-2 max-w-md text-[14px] leading-relaxed text-dim">{d}</p>
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong transition duration-500 group-hover:rotate-[-45deg] group-hover:border-transparent group-hover:text-black group-hover:bg-[var(--a)]" style={{ "--a": a } as CSSProperties} aria-hidden>→</span>
                </Link>
              </Reveal>
            ))}
          </section>

          <Reveal className="mt-20">
            <div className="glass rounded-[26px] p-6 sm:p-10">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
                <div>
                  <div className="eyebrow">Beyond the library</div>
                  <h2 className="h-display mt-4 text-[clamp(1.9rem,3.6vw,3rem)]">Want it built — or want to build like this?</h2>
                  <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-dim">The AURA skill ({TIERS.skill.label}) teaches your agent to art-direct bespoke 3D sites. Or pick any template here and have it customised for you for {TIERS.build.label}.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                  <Link href="/services#skill" className="btn btn-ghost">Explore the skill · {TIERS.skill.label}</Link>
                  <Link href="/services" className="aurora-ring aurora-ring-lg">Services <span aria-hidden className="text-[#8fb4ff]">→</span></Link>
                </div>
              </div>
            </div>
          </Reveal>
        </>
      )}
    </div>
  );
}

export default function LibraryPage({ shelf = "all" }: { shelf?: Shelf }) {
  const c = COPY[shelf];
  const worlds = useMemo(worldItems, []);
  const stats: [number, string][] = [[TEMPLATES.length, "3D worlds"], [PAGES.length, "app pages"], [REG_ITEMS.filter((i) => i.category !== TEXT_EFFECTS).length + ELEMENTS.length, "components"]];

  return (
    <main className="relative">
      <div className="relative mx-auto max-w-[1320px] px-5 pb-28 pt-32 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-5xl">
            <div className="rise eyebrow">{c.eyebrow}</div>
            <h1 className="rise h-display mt-4 text-[clamp(2.3rem,4.8vw,4.3rem)]" style={{ "--d": "100ms" } as CSSProperties}>{c.title}</h1>
            <p className="rise mt-4 max-w-2xl text-[15.5px] leading-relaxed text-fg/70" style={{ "--d": "220ms" } as CSSProperties}>{c.body}</p>
          </div>
          {shelf === "all" && (
            <dl className="rise flex gap-8" style={{ "--d": "340ms" } as CSSProperties}>
              {stats.map(([n, l]) => (
                <div key={l}>
                  <dt className="font-display text-4xl font-semibold tracking-[-0.04em]">{n}</dt>
                  <dd className="mt-1 font-mono text-[10px] tracking-[0.16em] text-dim uppercase">{l}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {shelf === "all" && (
          <div className="mt-10"><AgentLink counts={[{ label: "landing pages", n: TEMPLATES.length }, { label: "components", n: REG_ITEMS.length + ELEMENTS.length }, { label: "app pages", n: PAGES.length }]} /></div>
        )}

        <div className="mt-10">
          {shelf === "all" && <Overview />}
          {shelf === "worlds" && <Gallery items={worlds} />}
          {shelf === "pages" && <DemoShelf key="p" list={PAGES} cats={PAGE_CATEGORIES} placeholder="Search: login, booking, chart…" />}
        </div>
      </div>
    </main>
  );
}
