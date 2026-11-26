"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "@/lib/router";
import { REG_CATS, REG_ITEMS, TEXT_EFFECTS, agentPrompt, catBySlug, catHref, downloadClick, itemHref, itemsOf, type RegItem } from "@/lib/registry";
import { CodeViewer } from "@/components/code-viewer";
import { CopyButton } from "@/components/copy-button";
import { Reveal } from "@/components/reveal";
import { DemoCard } from "@/components/demo-frame";
import { ELEMENTS, elementsIn } from "@/lib/collections";
import { CAT_COLORS, DemoStage, Markdown, RegistryCard } from "@/components/registry/registry-ui";

const accentOf = (cat: string) => CAT_COLORS[Math.max(0, REG_CATS.findIndex((c) => c.slug === cat)) % CAT_COLORS.length];

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></svg>
);

/* ───────────── /components — the hub ───────────── */
export function ComponentsHub() {
  const cats = REG_CATS.filter((c) => c.slug !== TEXT_EFFECTS);
  return (
    <main className="mx-auto max-w-[1320px] px-5 pb-28 pt-40 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div className="max-w-3xl">
          <div className="eyebrow">Modular components</div>
          <h1 className="h-display mt-5 text-[clamp(2.8rem,7vw,6rem)]">Pieces you can<br /><span className="aurora-text">drop into anything.</span></h1>
          <p className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-fg/70">
            {REG_ITEMS.length} self-contained React components and {ELEMENTS.length} interactive demos in {REG_CATS.length} categories. One file each, zero dependencies, and a README written for your coding agent: download the folder, hand it over, done.
          </p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <a href="#download" onClick={downloadClick()} className="btn btn-primary h-[54px] px-8 text-[15px]"><DownloadIcon /> Download everything (.zip)</a>
          <span className="font-mono text-[10.5px] tracking-[0.16em] text-dim uppercase">{REG_ITEMS.length} components · {ELEMENTS.length} demos · README each · master agent guide</span>
        </div>
      </div>

      <ol className="mt-14 grid gap-4 md:grid-cols-3">
        {([["01", "Pick a piece", "Every card is the real component, running. Hover and click it."], ["02", "Download the folder", "A .tsx file plus README.md — install steps, props and gotchas for the agent."], ["03", "Tell your agent", "“Add the spotlight card to the pricing page.” Copy-agent-prompt does the rest."]] as const).map(([n, t, d]) => (
          <li key={n} className="panel flex gap-4 p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong font-mono text-xs text-aurora">{n}</span>
            <div><div className="font-display text-lg font-semibold tracking-[-0.02em]">{t}</div><p className="mt-1 text-[13.5px] leading-relaxed text-dim">{d}</p></div>
          </li>
        ))}
      </ol>

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        {cats.map((c, i) => {
          const list = itemsOf(c.slug);
          const accent = accentOf(c.slug);
          return (
            <Reveal key={c.slug} delay={(i % 2) * 80}>
              <article className="panel spot group overflow-hidden !rounded-[28px]" style={{ "--c": accent } as CSSProperties}>
                <DemoStage id={`${c.slug}/${list[0].slug}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-xl border border-line-strong text-[15px]" style={{ color: accent }} aria-hidden>{c.icon}</span>
                        <h2 className="font-display text-2xl font-semibold tracking-[-0.04em]">{c.name}</h2>
                        <span className="font-mono text-[11px] tracking-[0.14em] text-dim uppercase">{list.length + elementsIn(c.slug).length}</span>
                      </div>
                      <p className="mt-3 max-w-md text-[14px] leading-relaxed text-dim">{c.blurb}</p>
                    </div>
                    <a href="#download" onClick={downloadClick(c.slug)} className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong text-dim transition hover:border-aurora hover:bg-aurora hover:text-black" title={`Download all ${c.name}`} aria-label={`Download all ${c.name}`}><DownloadIcon /></a>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {list.map((it) => <Link key={it.slug} href={itemHref(c.slug, it.slug)} className="chip transition hover:border-aurora/60 hover:text-fg">{it.name}</Link>)}
                  </div>
                  <Link href={catHref(c.slug)} className="btn btn-ghost btn-sm mt-6">Browse {c.name.toLowerCase()} <span aria-hidden>→</span></Link>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>

      <Reveal>
        <Link href="/text-effects" className="glass spot group mt-8 flex flex-wrap items-center justify-between gap-6 rounded-[28px] p-8 transition duration-500 hover:-translate-y-1" style={{ "--c": "#5cffc4" } as CSSProperties}>
          <div>
            <div className="eyebrow">Its own shelf</div>
            <div className="h-display mt-3 text-[clamp(2rem,4vw,3.2rem)]">Text effects <span className="aurora-text">— import onto any text.</span></div>
            <p className="mt-3 max-w-lg text-[14px] text-dim">Scramble, shimmer, split-reveal, rotating words, typewriter, scroll-lit, marker highlight, glitch and count-up.</p>
          </div>
          <span className="btn btn-primary">Open text effects →</span>
        </Link>
      </Reveal>
    </main>
  );
}

/* ───────────── a category (also /text-effects) ───────────── */
export function CategoryView({ category }: { category: string }) {
  const cat = catBySlug(category)!;
  const list = itemsOf(category);
  const demos = useMemo(() => elementsIn(category), [category]);
  const [q, setQ] = useState("");
  const accent = accentOf(category);
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    const hit = (parts: string[]) => !n || parts.join(" ").toLowerCase().includes(n);
    return { items: list.filter((i) => hit([i.name, i.tagline, ...i.tags])), demos: demos.filter((d) => hit([d.name, d.tagline, d.blurb, d.category])) };
  }, [list, demos, q]);
  const isText = category === TEXT_EFFECTS;

  return (
    <main className="mx-auto max-w-[1320px] px-5 pb-28 pt-40 sm:px-8">
      <nav className="mb-6 font-mono text-[11px] tracking-[0.14em] text-dim uppercase" aria-label="Breadcrumb">
        {isText ? <Link href="/components" className="hover:text-fg">Components</Link> : <Link href="/components" className="hover:text-fg">Components</Link>}
        <span className="mx-2 text-white/20">/</span><span className="text-fg">{cat.name}</span>
      </nav>
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div className="max-w-3xl">
          <div className="eyebrow" style={{ color: accent }}>{isText ? "Text effects" : cat.name}</div>
          <h1 className="h-display mt-5 text-[clamp(2.6rem,6.4vw,5.4rem)]">
            {isText ? <>Text that <span className="aurora-text">performs.</span></> : <>{cat.name.split(" ")[0]} <span className="aurora-text">{cat.name.split(" ").slice(1).join(" ") || "ready to drop in."}</span></>}
          </h1>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-fg/70">{cat.blurb}</p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <a href="#download" onClick={downloadClick(category)} className="btn btn-primary h-[52px] px-7"><DownloadIcon /> Download all {list.length} (.zip)</a>
          <span className="font-mono text-[10.5px] tracking-[0.16em] text-dim uppercase">each with its own README</span>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center">
        <label className="glass relative block h-12 w-full max-w-[420px] rounded-full">
          <span className="sr-only">Filter</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Filter ${cat.name.toLowerCase()}…`} className="h-full w-full rounded-full bg-transparent px-6 text-[14.5px] outline-none placeholder:text-dim" />
        </label>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:px-0 lg:pb-0">
          {REG_CATS.map((c) => (
            <Link key={c.slug} href={catHref(c.slug)} aria-current={c.slug === category ? "page" : undefined} className={`shrink-0 rounded-full border px-3.5 py-2 text-[12.5px] transition ${c.slug === category ? "border-aurora bg-aurora text-[#021510]" : "border-line text-dim hover:border-line-strong hover:text-fg"}`}>{c.name}</Link>
          ))}
        </div>
      </div>

      <p className="mt-6 font-mono text-[11px] tracking-[0.14em] text-dim uppercase">{shown.items.length + shown.demos.length} / {list.length + demos.length} · every preview is the live component</p>
      {shown.items.length + shown.demos.length === 0 ? (
        <div className="panel mt-8 p-12 text-center text-dim">Nothing matches “{q}”. <button className="text-aurora underline" onClick={() => setQ("")}>Reset</button></div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shown.items.map((it, i) => <Reveal key={it.slug} delay={(i % 3) * 70}><RegistryCard item={it} index={list.indexOf(it)} accent={accent} /></Reveal>)}
          {shown.demos.map((d, i) => <Reveal key={d.slug} delay={((shown.items.length + i) % 3) * 70}><DemoCard demo={d} index={ELEMENTS.indexOf(d)} /></Reveal>)}
        </div>
      )}
    </main>
  );
}

/* ───────────── one component ───────────── */
export function ItemView({ item, code, readme, body }: { item: RegItem; code: string; readme: string; body: string }) {
  const [tab, setTab] = useState<"readme" | "source">("readme");
  const [replay, setReplay] = useState(0);
  const cat = catBySlug(item.category)!;
  const list = itemsOf(item.category);
  const i = list.findIndex((x) => x.slug === item.slug);
  const prev = list[(i + list.length - 1) % list.length];
  const next = list[(i + 1) % list.length];
  const accent = accentOf(item.category);
  const isText = item.category === TEXT_EFFECTS;
  const prompt = useMemo(() => agentPrompt(item, readme), [item, readme]);

  return (
    <main className="mx-auto max-w-[1320px] px-5 pb-28 pt-40 sm:px-8">
      <nav className="mb-6 font-mono text-[11px] tracking-[0.14em] text-dim uppercase" aria-label="Breadcrumb">
        <Link href="/components" className="hover:text-fg">Components</Link><span className="mx-2 text-white/20">/</span>
        <Link href={catHref(item.category)} className="hover:text-fg">{cat.name}</Link><span className="mx-2 text-white/20">/</span><span className="text-fg">{item.name}</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-8">
        <div className="max-w-3xl">
          <div className="eyebrow" style={{ color: accent }}>{isText ? "Text effect" : cat.name}</div>
          <h1 className="h-display mt-5 text-[clamp(2.6rem,6vw,5rem)]">{item.name}</h1>
          <p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-fg/70">{item.tagline}.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="chip">{item.file}</span><span className="chip">{item.lines} lines</span>
            <span className="chip">{item.deps.length ? item.deps.join(", ") : "0 dependencies"}</span>
            {item.tags.map((t) => <span key={t} className="chip">{t}</span>)}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a href="#download" onClick={downloadClick(item.category, item.slug)} className="btn btn-primary !h-14 !text-[15px]"><DownloadIcon /> Download {item.slug}.zip</a>
          <CopyButton text={prompt} label="Copy agent prompt" slug={`reg-${item.slug}`} />
        </div>
      </div>

      <div className="panel mt-10 overflow-hidden !rounded-[26px] p-2" style={{ "--c": accent } as CSSProperties}>
        <div className="flex items-center justify-between gap-3 px-3 py-2.5">
          <div className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-white/15" /><i className="size-2.5 rounded-full bg-white/15" /><i className="size-2.5 rounded-full bg-white/15" /></div>
          <div className="hidden max-w-sm flex-1 truncate rounded-full border border-line bg-black/30 px-4 py-1.5 text-center font-mono text-[11px] text-dim sm:block">{`<${item.name.replace(/[^A-Za-z0-9]+/g, "")} />`} · live</div>
          <button type="button" onClick={() => setReplay((r) => r + 1)} className="rounded-full px-3 py-1.5 text-xs text-aurora hover:bg-white/8">↻ Replay</button>
        </div>
        <DemoStage id={`${item.category}/${item.slug}`} mode="full" replay={replay} className="rounded-[18px]" />
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex gap-1 border-b border-line" role="tablist">
            {([["readme", "README (for your agent)"], ["source", `Source · ${item.file}`]] as const).map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`-mb-px border-b-2 px-4 py-3 text-[13.5px] transition ${tab === k ? "border-aurora text-fg" : "border-transparent text-dim hover:text-fg"}`}>{l}</button>
            ))}
          </div>
          <div className="mt-6">
            {tab === "readme" ? (
              <div className="panel p-6 sm:p-8">
                <div className="mb-2 flex justify-end"><CopyButton text={readme} label="Copy README" /></div>
                <Markdown source={body} />
              </div>
            ) : <CodeViewer files={[{ name: item.file, code }]} />}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
          <div className="panel p-5">
            <div className="eyebrow">Hand it to your agent</div>
            <ol className="mt-4 space-y-3 text-[13.5px] leading-relaxed text-dim">
              <li><b className="text-fg">1.</b> Download the zip (or copy the source).</li>
              <li><b className="text-fg">2.</b> Drop the folder into the project, or attach it to the chat.</li>
              <li><b className="text-fg">3.</b> Paste the agent prompt and say where to use it.</li>
            </ol>
            <div className="mt-5 flex flex-wrap gap-2"><CopyButton text={prompt} label="Agent prompt" /><CopyButton text={code} label="Copy source" /></div>
          </div>
          <div className="panel p-5">
            <div className="eyebrow">In this folder</div>
            <ul className="mt-4 space-y-2 font-mono text-[12.5px] text-dim">
              <li>📄 {item.file}</li><li>📘 README.md</li><li>📜 LICENSE.txt</li>
            </ul>
          </div>
          <div className="panel p-5">
            <div className="eyebrow">More {cat.name.toLowerCase()}</div>
            <ul className="mt-4 space-y-1">
              {list.filter((x) => x.slug !== item.slug).slice(0, 6).map((x) => <li key={x.slug}><Link href={itemHref(x.category, x.slug)} className="block rounded-lg px-2 py-1.5 text-[13.5px] text-dim transition hover:bg-white/6 hover:text-fg">{x.name}</Link></li>)}
            </ul>
          </div>
        </aside>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2">
        {[["← Previous", prev], ["Next →", next]].map(([l, t], k) => {
          const x = t as RegItem;
          return (
            <Link key={l as string} href={itemHref(x.category, x.slug)} className={`panel group flex flex-col gap-1 p-6 transition hover:border-line-strong ${k ? "sm:text-right" : ""}`}>
              <span className="font-mono text-[10.5px] tracking-[0.18em] text-dim uppercase">{l as string}</span>
              <span className="font-display text-xl font-semibold tracking-[-0.03em]">{x.name}</span>
              <span className="text-[13px] text-dim">{x.tagline}</span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
