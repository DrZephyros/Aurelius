"use client";

import { useState } from "react";
import { Link } from "@/lib/router";
import { Reveal } from "@/components/reveal";
import { Specimen } from "@/components/specimen";
import { AgentLink } from "@/components/agent-link";
import { SHELVES } from "@/components/chrome";
import { bySlug, TEMPLATES, type Template } from "@/lib/templates";
import { REG_ITEMS } from "@/lib/registry";
import { PAGES, ELEMENTS } from "@/lib/collections";
import { TIERS } from "@/lib/site";
import { BUNDLES } from "@/bundles/data";

/* Three complete experiences, presented in one uninterrupted scroll. */
const SAMPLES = ["folio", "nebula"]
  .map((s) => bySlug(s))
  .filter((t): t is Template => !!t);
const yoru = BUNDLES.find((b) => b.slug === "yoru")!;
const YORU = {
  slug: yoru.slug,
  name: yoru.name,
  tagline: yoru.tagline,
  accent: yoru.theme.accent,
  bg: yoru.theme.bg,
};

export default function Home() {
  // worlds boot one after another, ahead of the reader, so each is ready when it arrives
  const [ready, setReady] = useState(0);

  return (
    <main>
      {/* HERO — the aurora world is the fixed backdrop (App.tsx) */}
      <section className="mx-auto flex min-h-[92svh] max-w-[1320px] flex-col justify-center px-5 pb-16 pt-28 sm:px-8">
        <div className="eyebrow rise">Project Aurelius · immersive 3D websites</div>
        <h1 className="h-display rise mt-6 text-[clamp(3.2rem,10.5vw,9.5rem)] leading-[0.88]" style={{ ["--d" as string]: "100ms" }}>
          Websites you<br />can <span className="aurora-text">walk into.</span>
        </h1>
        <p className="rise mt-8 max-w-[600px] text-[18px] leading-relaxed text-fg/70" style={{ ["--d" as string]: "220ms" }}>
          Scroll-driven, game-grade 3D — free to study and steal, with an agent link that hands the whole library to your AI. Three complete samples are waiting below.
        </p>
        <div className="rise mt-10 flex flex-wrap items-center gap-4" style={{ ["--d" as string]: "340ms" }}>
          <Link href="/library" className="btn btn-primary h-[58px] px-9 text-[16px]">Browse the free library →</Link>
          <Link href="/services" className="aurora-ring aurora-ring-lg">Services <span aria-hidden className="text-[#8fb4ff]">→</span></Link>
        </div>
        <a href="#showcase" className="rise mt-14 inline-flex w-fit items-center gap-3 font-mono text-[11px] tracking-[0.2em] text-dim uppercase transition hover:text-fg" style={{ ["--d" as string]: "460ms" }}>
          <span className="grid size-8 place-items-center rounded-full border border-line-strong">↓</span> Explore the samples
        </a>
      </section>

      {/* SAMPLES — each is the real site, scrolled through the page */}
      <section id="showcase" className="relative scroll-mt-16 bg-bg/70 backdrop-blur-sm">
        <div className="mx-auto max-w-[1320px] px-5 pb-8 pt-20 sm:px-8">
          <div className="eyebrow">Samples · 03 live experiences</div>
          <h2 className="h-display mt-4 text-[clamp(2rem,4.8vw,4.2rem)]">One page. Three worlds.</h2>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-dim">Folio, Aphelion, then Yoru. No skipping and nothing to configure — just keep scrolling.</p>
        </div>
        {SAMPLES.map((t, i) => (
          <Specimen key={t.slug} t={t} load={i <= ready} onReady={() => setReady((r) => Math.max(r, i + 1))} />
        ))}
        <Specimen
          t={YORU}
          load={ready >= SAMPLES.length}
          onReady={() => setReady((r) => Math.max(r, SAMPLES.length + 1))}
          src="/bundles/yoru?embed=scroll"
        />
      </section>

      {/* THE LIBRARY + AGENT LINK */}
      <section className="bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8">
          <Reveal>
            <div className="eyebrow">The free library</div>
            <h2 className="h-display mt-4 text-[clamp(2rem,4.8vw,4.2rem)]">All of it is yours to study.</h2>
            <p className="mt-4 max-w-[560px] text-dim">{TEMPLATES.length} landing pages, {REG_ITEMS.length} components, {PAGES.length} app pages, {ELEMENTS.length} elements and a prompt library — live, readable, downloadable, and free.</p>
          </Reveal>
          <div className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SHELVES.map((s, i) => (
              <Reveal key={s.href} delay={(i % 3) * 60}>
                <Link href={s.href} className="panel spot group flex h-full items-center justify-between gap-4 !rounded-[20px] p-5 transition hover:-translate-y-1">
                  <span><span className="block font-display text-[19px] font-semibold tracking-[-0.03em]">{s.label}</span><span className="mt-1 block text-[13px] text-dim">{s.hint}</span></span>
                  <span className="text-aurora transition group-hover:translate-x-1">→</span>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-14">
            <AgentLink counts={[{ label: "landing pages", n: TEMPLATES.length }, { label: "components", n: REG_ITEMS.length }, { label: "app pages", n: PAGES.length }, { label: "elements", n: ELEMENTS.length }]} />
          </div>

          {/* SERVICES */}
          <div className="mt-24 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <Reveal>
              <div className="eyebrow">Want the real thing?</div>
              <h2 className="h-display mt-4 text-[clamp(2rem,4.4vw,3.8rem)]">Build it yourself — or have it built.</h2>
              <p className="mt-4 max-w-[520px] text-dim">The skill ({TIERS.skill.label}) teaches your agent to art-direct a $10,000-grade 3D site. Or pick a template and I'll customise it for you in five days ({TIERS.build.label}).</p>
              <Link href="/services" className="aurora-ring aurora-ring-lg mt-8">See services &amp; pricing <span aria-hidden className="text-[#8fb4ff]">→</span></Link>
            </Reveal>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[["Library", "Free", "Study, steal, agent link", "/library"], ["The skill", TIERS.skill.label, "AURA · one-time", "/services#skill-pricing"], ["Built for you", TIERS.build.label, "Customised template · 5 days", "/services#build"]].map(([n, p, d, h]) => (
                <Link key={n} href={h} className="panel flex items-center justify-between gap-4 !rounded-[18px] px-5 py-4 transition hover:-translate-y-0.5">
                  <span><span className="block font-display text-[17px] font-semibold">{n}</span><span className="block text-[12.5px] text-dim">{d}</span></span>
                  <span className="font-display text-2xl font-semibold tracking-[-0.04em]">{p}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
