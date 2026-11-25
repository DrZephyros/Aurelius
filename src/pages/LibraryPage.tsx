import type { CSSProperties, ReactNode } from "react";
import { Link, navigate } from "@/lib/router";
import { TEMPLATES, FILTERS } from "@/lib/templates";
import { ELEMENTS, PAGES } from "@/lib/collections";
import { ALL_PROMPTS } from "@/lib/library";
import { TOOLS } from "@/pages/ToolsPage";
import { Reveal } from "@/components/reveal";
import { RequestForm } from "@/components/request-form";

const I = (d: ReactNode) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d}</svg>
);
const ICONS = {
  worlds: I(<><path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7L12 2.5Z" /><path d="m3.5 7 8.5 5 8.5-5M12 12v9.5" /></>),
  pages: I(<><rect x="3.5" y="4" width="17" height="16" rx="2.5" /><path d="M3.5 9h17M8 14h4" /></>),
  elements: I(<><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="3.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="3.5" /><path d="M13.5 17h7M17 13.5v7" /></>),
  prompts: I(<><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4h0A2.5 2.5 0 0 1 4 13.5v-8Z" /><path d="m9 8 2 2-2 2M13 12h2.5" /></>),
  tools: I(<><path d="M14.5 6.5a4 4 0 0 0 5 5L11 20a2.1 2.1 0 0 1-3-3l8.5-8.5" /><path d="m14.5 6.5 3-3 3 3-3 3" /></>),
};

function goFilter(f: string) {
  navigate("/landing-pages");
  setTimeout(() => window.dispatchEvent(new CustomEvent("aurelius:filter", { detail: f })), 160);
}

function Shelf({ href, icon, title, count, unit, copy, className = "", children, accent = "#5cffc4" }: { href: string; icon: ReactNode; title: string; count: number; unit: string; copy: string; className?: string; children?: ReactNode; accent?: string }) {
  return (
    <Link href={href} className={`glass spot group relative flex flex-col overflow-hidden rounded-[26px] p-6 transition duration-500 hover:-translate-y-1 hover:[border-color:var(--c)] sm:p-7 ${className}`} style={{ "--c": accent + "88" } as CSSProperties}>
      <div className="flex items-start justify-between">
        <span className="grid size-12 place-items-center rounded-2xl border border-line-strong bg-white/[0.03] transition group-hover:scale-110" style={{ color: accent }}>{icon}</span>
        <span className="grid size-10 place-items-center rounded-full border border-line-strong text-lg transition duration-500 group-hover:rotate-[-45deg] group-hover:border-transparent group-hover:bg-[var(--bg)] group-hover:text-black" style={{ ["--bg" as string]: accent }} aria-hidden>
          →
        </span>
      </div>
      <div className="mt-8 flex items-baseline gap-3">
        <h3 className="font-display text-[1.7rem] font-semibold tracking-[-0.04em]">{title}</h3>
        <span className="font-mono text-[11px] tracking-[0.14em] uppercase" style={{ color: accent }}>{count} {unit}</span>
      </div>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-dim">{copy}</p>
      {children}
    </Link>
  );
}

export default function LibraryPage() {
  const worldsShown = TEMPLATES.slice(0, 8);
  const goals: [string, string, string][] = [
    ["I need a website today", "Browse worlds → download → edit CONFIG", "/landing-pages"],
    ["I need app screens", "Auth, pricing, checkout, dashboards", "/pages"],
    ["I'm building with AI", "Prompts, rules files and a token counter", "/prompts"],
  ];

  return (
    <main className="mx-auto max-w-[1320px] px-5 pb-28 pt-40 sm:px-8">
      {/* header */}
      <header className="max-w-3xl">
        <div className="rise eyebrow">The library</div>
        <h1 className="rise h-display mt-5 text-[clamp(2.8rem,7vw,6.4rem)]" style={{ "--d": "120ms" } as CSSProperties}>
          Five shelves.<br /><span className="aurora-text">Every one lit.</span>
        </h1>
        <p className="rise mt-6 max-w-xl text-[16.5px] leading-relaxed text-fg/70" style={{ "--d": "260ms" } as CSSProperties}>
          Pick a shelf, or just start typing. Everything here is real, running code you can download and change.
        </p>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("aurelius:palette"))}
          className="rise glass group mt-9 flex h-[60px] w-full max-w-[640px] items-center gap-4 rounded-full px-6 text-left transition hover:[border-color:rgb(92_255_196/0.5)]"
          style={{ "--d": "380ms" } as CSSProperties}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-aurora"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <span className="flex-1 text-[15px] text-dim">Search worlds, pages, prompts, tools…</span>
          <kbd className="rounded-md border border-line-strong px-2 py-1 font-mono text-[11px] text-dim">⌘ K</kbd>
        </button>
      </header>

      {/* where to start */}
      <Reveal className="mt-14">
        <div className="mb-4 font-mono text-[11px] tracking-[0.2em] text-dim uppercase">Where to start</div>
        <div className="grid gap-3 md:grid-cols-3">
          {goals.map(([t, d, h]) => (
            <Link key={t} href={h} className="glass group flex items-center justify-between gap-4 rounded-2xl px-5 py-4 transition hover:[border-color:rgb(92_255_196/0.45)]">
              <div>
                <div className="font-display text-[15px] font-semibold tracking-[-0.02em]">{t}</div>
                <div className="mt-0.5 text-[12.5px] text-dim">{d}</div>
              </div>
              <span className="text-aurora transition group-hover:translate-x-1" aria-hidden>→</span>
            </Link>
          ))}
        </div>
      </Reveal>

      {/* bento of shelves */}
      <div className="mt-12 grid gap-4 lg:grid-cols-6">
        <Reveal className="lg:col-span-4 lg:row-span-2">
          <Shelf href="/landing-pages" icon={ICONS.worlds} title="Landing pages" count={TEMPLATES.length} unit="3D worlds" copy="Scroll-driven Three.js sites for portfolios, clinics, cars, space, food and more. Every card runs the real template." className="h-full min-h-[420px]">
            <div className="mt-8 grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
              {worldsShown.map((t) => (
                <span key={t.slug} className="relative flex aspect-[4/3] items-end overflow-hidden rounded-xl border border-line p-2.5 transition duration-500 group-hover:border-line-strong" style={{ background: `radial-gradient(120% 100% at 25% 15%, ${t.accent}55, transparent 62%), ${t.bg}` }}>
                  <i className="absolute right-2.5 top-2.5 size-1.5 rounded-full" style={{ background: t.accent, boxShadow: `0 0 12px ${t.accent}` }} />
                  <span className={`text-[12px] font-semibold tracking-[-0.01em] ${t.theme === "Light" ? "text-black/80" : "text-white/90"}`}>{t.name}</span>
                </span>
              ))}
            </div>
            <div className="mt-4 font-mono text-[11px] tracking-[0.14em] text-dim uppercase">+ {TEMPLATES.length - worldsShown.length} more · newest: Apex Kestrel</div>
          </Shelf>
        </Reveal>
        <Reveal delay={100} className="lg:col-span-2">
          <Shelf href="/pages" icon={ICONS.pages} title="App pages" count={PAGES.length} unit="screens" copy="Sign in, pricing, checkout, dashboard, settings — production-ready." accent="#3de7ff" className="h-full" />
        </Reveal>
        <Reveal delay={180} className="lg:col-span-2">
          <Shelf href="/elements" icon={ICONS.elements} title="Elements" count={ELEMENTS.length} unit="components" copy="Magnetic buttons, spotlight cards, a command bar, a kanban — all interactive." accent="#a58bff" className="h-full" />
        </Reveal>
        <Reveal delay={100} className="lg:col-span-3">
          <Shelf href="/prompts" icon={ICONS.prompts} title="Prompts" count={ALL_PROMPTS.length} unit="prompts" copy="Fill-in-the-blank prompts that make AI coding tools behave. Search, favourite, copy." accent="#ff7ad9" className="h-full" />
        </Reveal>
        <Reveal delay={180} className="lg:col-span-3">
          <Shelf href="/tools" icon={ICONS.tools} title="Vibe toolkit" count={TOOLS.length} unit="tools" copy="Rules-file generator, kickoff prompts, bug-to-prompt, token counter, palette checker." accent="#ffd28a" className="h-full" />
        </Reveal>
      </div>

      {/* browse by vibe */}
      <Reveal className="mt-16">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">Browse worlds by use case</h2>
          <Link href="/landing-pages" className="text-[13px] text-dim transition hover:text-aurora">View all →</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.filter((f) => f !== "All").map((f) => (
            <button key={f} onClick={() => goFilter(f)} className="glass rounded-full px-4 py-2 text-[13px] text-dim transition hover:text-fg hover:[border-color:rgb(92_255_196/0.5)]">{f}</button>
          ))}
        </div>
      </Reveal>

      {/* request */}
      <Reveal className="mt-20">
        <div className="glass rounded-[26px] p-6 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <div className="eyebrow">Missing a world?</div>
              <h2 className="h-display mt-4 text-[clamp(1.9rem,3.6vw,3rem)]">Tell us what to light up next.</h2>
              <p className="mt-3 max-w-md text-[14.5px] leading-relaxed text-dim">Describe a use case or a vibe. Requests stay on your device until there's a server to send them to.</p>
            </div>
            <RequestForm />
          </div>
        </div>
      </Reveal>
    </main>
  );
}
