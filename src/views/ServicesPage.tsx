"use client";

import { useRef } from "react";
import { Link } from "@/lib/router";
import { Reveal } from "@/components/reveal";
import SkillLanding from "@/views/SkillLanding";
import { AuraStage, AuraTierCard } from "@/components/aura-showcase";
import { SKILL, TIERS } from "@/lib/site";

const Tick = () => <span className="mt-0.5 text-aurora" aria-hidden>✦</span>;

function Tier({ id, tag, name, price, unit, blurb, items, cta, featured }: { id: string; tag: string; name: string; price: string; unit: string; blurb: string; items: string[]; cta: React.ReactNode; featured?: boolean }) {
  return (
    <article id={id} className={`relative flex h-full flex-col rounded-[28px] p-7 sm:p-8 ${featured ? "border border-[rgb(92_255_196/0.4)] bg-[linear-gradient(160deg,rgb(10_24_34/0.95),rgb(4_7_14/0.95))] shadow-[0_30px_90px_-30px_rgb(92_255_196/0.35)]" : "panel"}`}>
      {featured && <span className="absolute -top-3 left-7 rounded-full bg-aurora px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.16em] text-[#021510] uppercase">Most popular</span>}
      <div className="font-mono text-[11px] tracking-[0.2em] text-aurora uppercase">{tag}</div>
      <h3 className="mt-3 font-display text-[28px] font-semibold tracking-[-0.04em]">{name}</h3>
      <div className="mt-5 flex items-end gap-2"><span className="font-display text-6xl font-semibold tracking-[-0.06em]">{price}</span><span className="pb-2 font-mono text-[10.5px] tracking-[0.16em] text-dim uppercase">{unit}</span></div>
      <p className="mt-3 text-[14px] leading-relaxed text-dim">{blurb}</p>
      <ul className="mt-6 flex-1 space-y-2.5">{items.map((t) => (<li key={t} className="flex gap-3 text-[13.5px] text-fg/85"><Tick />{t}</li>))}</ul>
      <div className="mt-8">{cta}</div>
    </article>
  );
}

/* Warm sibling of AuraTierCard: same construction, gold-to-coral palette, so the two paid tiers read as a pair. */
function BuildTierCard({ items, cta }: { items: string[]; cta: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <article id="tier-build" ref={ref} onPointerMove={move} className="group relative h-full lg:-my-3">
      <div className="absolute -inset-px rounded-[29px] opacity-70 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "linear-gradient(140deg, rgb(255 210 138 / .65), rgb(255 159 122 / .15) 45%, rgb(255 210 138 / .4))" }} aria-hidden />
      <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] bg-[linear-gradient(165deg,rgb(30_20_14),rgb(8_6_6)_62%)] p-7 sm:p-8">
        <div className="pointer-events-none absolute -top-24 -right-20 size-[300px] rounded-full opacity-60 blur-3xl" style={{ background: "radial-gradient(circle, rgb(255 210 138 / .5), transparent 65%)", animation: "orb-a 9s ease-in-out infinite alternate" }} />
        <div className="pointer-events-none absolute -bottom-28 -left-24 size-[300px] rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle, rgb(255 159 122 / .45), transparent 65%)", animation: "orb-a 11s ease-in-out infinite alternate-reverse" }} />
        <div className="grid-dots pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(340px circle at var(--mx, 50%) var(--my, 0%), rgb(255 210 138 / .13), transparent 62%)" }} />
        <div className="aura-sheen" aria-hidden />

        <div className="relative flex items-center justify-between">
          <span className="rounded-full px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.16em] text-[#1a0f05] uppercase" style={{ background: "linear-gradient(120deg,#ffd28a,#ff9f7a)" }}>Done for you</span>
          <span className="chip !border-white/15 !text-fg/70">{TIERS.build.days} days</span>
        </div>

        <div className="relative mt-7">
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase" style={{ color: "#ffd28a" }}>Custom build</div>
          <h3 className="relative mt-1 font-display text-[64px] leading-[0.98] font-bold tracking-[-0.05em] bg-[linear-gradient(120deg,#fff3e0,#ffd28a_45%,#ff9f7a)] bg-clip-text text-transparent sm:text-[72px]">I&rsquo;ll build it</h3>
        </div>

        <div className="relative mt-6 flex items-end gap-2">
          <span className="font-display text-6xl font-semibold tracking-[-0.06em]">{TIERS.build.label}</span>
          <span className="pb-2 font-mono text-[10.5px] tracking-[0.16em] text-dim uppercase">one template · {TIERS.build.revisions} revision</span>
        </div>
        <p className="relative mt-3 text-[14px] leading-relaxed text-fg/70">Pick any template from the library — I customise it to your brand and hand over the code.</p>

        <ul className="relative mt-6 flex-1 space-y-2.5">
          {items.map((t, i) => (
            <li key={t} className="flex gap-3 text-[13.5px] text-fg/90"><span className="mt-0.5" style={{ color: ["#ffd28a", "#ffb98a", "#ff9f7a"][i % 3] }} aria-hidden>✦</span>{t}</li>
          ))}
        </ul>

        <div className="relative mt-8">{cta}</div>
      </div>
    </article>
  );
}

export default function ServicesPage() {
  return (
    <main className="relative">
      <section className="mx-auto max-w-[1320px] px-5 pb-14 pt-36 sm:px-8 sm:pt-40">
        <div className="eyebrow">Services</div>
        <h1 className="h-display mt-5 text-[clamp(2.8rem,8vw,7rem)] leading-[0.9]">Three ways in.<br /><span className="aurora-text">Start free.</span></h1>
        <p className="mt-6 max-w-[620px] text-[17px] leading-relaxed text-fg/70">Browse the library for nothing. Give your agent the skill to build the real thing. Or hand me the brief and have it built for you in five days.</p>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-[1320px] scroll-mt-24 px-5 pb-24 sm:px-8">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-3">
          <Reveal className="h-full">
            <Tier id="tier-library" tag="Library" name="Study & steal" price="Free" unit="forever"
              blurb="Everything we've built, running live and open to read."
              items={["24 cinematic 3D landing pages", "50 drop-in components + 9 text effects", "12 app pages, 9 interactive elements", "A prompt library for every stage", "An agent link — give any AI the whole library"]}
              cta={<Link href="/library" className="btn btn-ghost h-[52px] w-full">Browse the library</Link>} />
          </Reveal>
          <Reveal className="h-full" delay={80}>
            <AuraTierCard items={["Deep references on direction, light, motion, type and QA", "Cinematic engine + 4 finished reference worlds (incl. a Folio portfolio)", "A QA gate that scrolls, screenshots and scores your site", "Works as a Claude skill, Cursor rule or AGENTS.md include", "Unlimited projects · free 2.x updates"]} />
          </Reveal>
          <Reveal className="h-full" delay={160}>
            <BuildTierCard
              items={["One of the library's templates, fully customised", "Your copy, colours, imagery and 3D swapped in", "Mobile edit, metadata and a launch checklist", `${TIERS.build.revisions} round of revisions included`, `Delivered in ${TIERS.build.days} days · source code is yours`]}
              cta={<Link href="/services#build" className="btn btn-primary btn-shimmer h-[56px] w-full text-[15px]">Book a build — {TIERS.build.label} <span aria-hidden>→</span></Link>} />
          </Reveal>
        </div>
        <p className="mt-6 text-center text-[12.5px] text-dim">Secure checkout for the skill · the build is confirmed by email within 24 hours, invoiced only once we agree on the template.</p>
      </section>

      {/* THE SKILL — fully integrated, nothing to leave the page for */}
      <div id="skill" className="scroll-mt-20">
        <div className="mx-auto max-w-[1320px] px-5 pb-6 sm:px-8">
          <AuraStage>
            <div className="eyebrow">The skill · AURA {SKILL.version}</div>
            <h2 className="h-display mt-4 text-[clamp(2.2rem,4.6vw,4.2rem)]">Stop asking AI for “a 3D website”.<br /><span className="aurora-text">Hire the art director.</span></h2>
            <p className="mt-5 max-w-[520px] text-[16.5px] leading-relaxed text-fg/70">AURA makes your agent direct, build and QA scroll-driven, game-grade 3D sites — as a cinematic <b className="text-fg">world</b> or an editorial <b className="text-fg">folio</b> — for any brand, from one prompt.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/skill/checkout" className="btn btn-primary btn-shimmer h-[54px] px-8">Get AURA — {TIERS.skill.label}</Link>
              <Link href="/services#pipeline" className="btn btn-ghost h-[54px] px-6">See the pipeline ↓</Link>
            </div>
          </AuraStage>
        </div>
        <SkillLanding />
        <div className="mx-auto max-w-[1320px] px-5 pb-24 sm:px-8">
          <div className="panel flex flex-wrap items-center justify-between gap-5 !rounded-[26px] p-7 sm:p-9">
            <div><h3 className="h-display text-[clamp(1.6rem,3vw,2.4rem)]">Ready to build with it?</h3><p className="mt-2 text-dim">One-time {TIERS.skill.label}. Instant download. Unlimited projects.</p></div>
            <Link href="/skill/checkout" className="btn btn-primary h-[56px] px-9 text-[15px]">Get AURA — {TIERS.skill.label}</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
