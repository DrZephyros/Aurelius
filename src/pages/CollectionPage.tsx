import { useMemo, useState } from "react";
import { Link } from "@/lib/router";
import { ELEMENTS, ELEMENT_CATEGORIES, PAGES, PAGE_CATEGORIES, type Kind } from "@/lib/collections";
import { DemoCard } from "@/components/demo-frame";
import { Reveal } from "@/components/reveal";

const COPY = {
  page: {
    eyebrow: "App pages",
    title: ["The screens every product needs, ", "finished."],
    body: "Sign in, sign up, reset, pricing, checkout, dashboard, settings, onboarding and a 404 people actually enjoy. Each one is a single HTML file with real validation, real states and real motion — not a screenshot of a form.",
    placeholder: "Search: login, payment, chart…",
    note: "Every card is the live page. Open one to use it, read the source and download the file.",
    stats: [["9", "production-ready pages"], ["0", "dependencies"], ["1", "file each"]],
  },
  element: {
    eyebrow: "Interactive elements",
    title: ["Small things that make people ", "smile."],
    body: "Magnetic buttons, a spotlight bento, a ⌘K menu, a magnifying dock, toasts with undo, a kanban board and more. Each is a self-contained, copy-pasteable HTML file that rewards you for poking at it.",
    placeholder: "Search: drag, menu, motion…",
    note: "Open any element to play with it full-size — then copy the code straight into your project.",
    stats: [["10", "crafted interactions"], ["0", "libraries"], ["60", "fps, smooth"]],
  },
} as const;

export default function CollectionPage({ kind }: { kind: Kind }) {
  const list = kind === "page" ? PAGES : ELEMENTS;
  const cats = (kind === "page" ? PAGE_CATEGORIES : ELEMENT_CATEGORIES) as readonly string[];
  const c = COPY[kind];
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return list.filter((d) => (cat === "All" || d.category === cat) && (!n || [d.name, d.tagline, d.blurb, d.category, ...d.features].join(" ").toLowerCase().includes(n)));
  }, [list, cat, q]);

  return (
    <main className="relative">
      <div className="aurora pointer-events-none absolute inset-x-0 top-0 h-[640px]" aria-hidden />
      <div className="relative mx-auto max-w-[1320px] px-5 pb-28 pt-36 sm:px-8">
        <div className="grid items-end gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="rise eyebrow">{c.eyebrow}</div>
            <h1 className="h-display rise mt-6 text-[clamp(2.8rem,7vw,6.6rem)]" style={{ "--d": "120ms" } as React.CSSProperties}>
              {c.title[0]}<span className="text-aurora">{c.title[1]}</span>
            </h1>
          </div>
          <div className="rise" style={{ "--d": "260ms" } as React.CSSProperties}>
            <p className="text-[16px] leading-relaxed text-dim">{c.body}</p>
            <dl className="mt-7 flex gap-10">
              {c.stats.map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-3xl font-semibold tracking-[-0.04em]">{v}</dt>
                  <dd className="mt-1 font-mono text-[10px] tracking-[0.16em] text-dim uppercase">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 lg:flex-row lg:items-center">
          <label className="relative block lg:w-72">
            <span className="sr-only">Search</span>
            <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dim" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={c.placeholder} className="h-11 w-full rounded-full border border-line bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition placeholder:text-dim/70 focus:border-aurora/60" />
          </label>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-1 lg:flex-wrap lg:overflow-visible lg:px-0 lg:pb-0" role="tablist">
            {cats.map((f) => (
              <button key={f} role="tab" aria-selected={cat === f} onClick={() => setCat(f)} className={`shrink-0 rounded-full border px-4 py-2 text-[13px] transition ${cat === f ? "border-aurora bg-aurora text-[#021510]" : "border-line text-dim hover:border-line-strong hover:text-fg"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-5 font-mono text-[11px] tracking-[0.14em] text-dim uppercase">{shown.length} / {list.length} · {c.note}</p>

        {shown.length === 0 ? (
          <div className="panel mt-8 p-12 text-center text-dim">Nothing matches “{q}”. <button className="text-aurora underline" onClick={() => { setQ(""); setCat("All"); }}>Reset</button></div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((d, i) => (
              <Reveal key={d.slug} delay={(i % 3) * 70}>
                <DemoCard demo={d} index={list.findIndex((x) => x.slug === d.slug)} />
              </Reveal>
            ))}
          </div>
        )}

        <Reveal className="mt-24">
          <div className="panel spot relative overflow-hidden p-10 sm:p-14">
            <div className="aurora pointer-events-none absolute inset-0 opacity-60" aria-hidden />
            <div className="relative flex flex-wrap items-center justify-between gap-8">
              <div className="max-w-xl">
                <div className="eyebrow">Keep going</div>
                <h2 className="h-display mt-4 text-[clamp(2rem,4vw,3.4rem)]">{kind === "page" ? "Pair them with a landing page." : "Drop them into a landing page."}</h2>
                <p className="mt-3 text-[15px] text-dim">{kind === "page" ? "A cinematic 3D landing page gets them to your sign-up. These pages take it from there." : "Every element is dependency-free, so it works inside any of the 24 landing pages — or your own site."}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/landing-pages" className="btn btn-primary">Browse landing pages</Link>
                <Link href={kind === "page" ? "/elements" : "/pages"} className="btn btn-ghost">{kind === "page" ? "Interactive elements" : "App pages"}</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </main>
  );
}
