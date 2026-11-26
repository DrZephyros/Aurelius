"use client";

import { useState } from "react";
import { Link } from "@/lib/router";
import { Reveal } from "@/components/reveal";
import { RequestForm } from "@/components/request-form";
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

export default function ServicesPage() {
  const [sent, setSent] = useState(false);
  return (
    <main className="relative">
      <section className="mx-auto max-w-[1320px] px-5 pb-14 pt-36 sm:px-8 sm:pt-40">
        <div className="eyebrow">Services</div>
        <h1 className="h-display mt-5 text-[clamp(2.8rem,8vw,7rem)] leading-[0.9]">Three ways in.<br /><span className="aurora-text">Start free.</span></h1>
        <p className="mt-6 max-w-[620px] text-[17px] leading-relaxed text-fg/70">Browse the library for nothing. Give your agent the skill to build the real thing. Or hand me the brief and have it built for you in five days.</p>
        <nav className="mt-8 flex flex-wrap gap-2 text-[13px]" aria-label="On this page">
          {[["Pricing", "pricing"], ["The skill", "skill"], ["Pipeline", "pipeline"], ["Build it for me", "build"], ["FAQ", "faq"]].map(([l, h]) => (<Link key={h} href={`/services#${h}`} className="glass rounded-full px-4 py-2 text-dim transition hover:text-fg">{l}</Link>))}
        </nav>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-[1320px] scroll-mt-24 px-5 pb-24 sm:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
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
            <Tier id="tier-build" tag="Done for you" name="I'll build it" price={TIERS.build.label} unit={`${TIERS.build.days} days`}
              blurb="Pick any template from the library — I customise it to your brand and hand over the code."
              items={["One of the library's templates, fully customised", "Your copy, colours, imagery and 3D swapped in", "Mobile edit, metadata and a launch checklist", `${TIERS.build.revisions} round of revisions included`, `Delivered in ${TIERS.build.days} days · source code is yours`]}
              cta={<Link href="/services#build" className="btn btn-ghost h-[52px] w-full">Book a build — {TIERS.build.label}</Link>} />
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

      {/* BUILD IT FOR ME */}
      <section id="build" className="mx-auto max-w-[1200px] scroll-mt-24 px-5 pb-28 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <div className="eyebrow">Done for you · {TIERS.build.label}</div>
            <h2 className="h-display mt-5 text-[clamp(2.4rem,5.4vw,4.8rem)] leading-[0.92]">I'll build it<br /><span className="aurora-text">for you.</span></h2>
            <p className="mt-6 max-w-[480px] text-[16px] leading-relaxed text-fg/70">Choose a template from the library, tell me about your product, place or person — I customise it into your site, with one round of revisions, in five days.</p>
            <ol className="mt-8 space-y-4 text-[14px] text-fg/80">
              {[["Pick", "any template in the library (or let me recommend one)"], ["Brief", "send your copy, brand and references"], ["Day 5", "your customised site, source code included"], ["Revise", "one round of changes, on me"]].map(([a, b], i) => (
                <li key={a} className="flex gap-4"><span className="font-mono text-[11px] tracking-[0.18em] text-aurora">0{i + 1}</span><span><b className="text-fg">{a}</b> — {b}</span></li>
              ))}
            </ol>
            <p className="mt-8 text-[13px] text-dim">Want to browse first? <Link href="/library" className="text-aurora hover:underline">Open the library →</Link></p>
          </div>
          <div className="panel !rounded-[28px] p-6 sm:p-8">
            {sent ? (
              <div className="py-10 text-center"><div className="text-5xl text-aurora">✦</div><h3 className="h-display mt-4 text-3xl">You're on the list.</h3><p className="mx-auto mt-3 max-w-[340px] text-dim">I'll email within 24 hours to confirm your template and timeline. The {TIERS.build.label} invoice follows once we agree.</p><Link href="/library" className="btn btn-ghost mt-8">Keep browsing the library</Link></div>
            ) : (
              <RequestForm plan="build" onDone={() => setSent(true)} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
