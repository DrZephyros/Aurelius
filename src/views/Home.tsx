"use client";

import { Link } from "@/lib/router";
import { Reveal } from "@/components/reveal";
import { LiveWorld } from "@/components/live-world";
import { DIRECTIONS, EXAMPLES, SKILL_STATS } from "@/lib/skill";
import { SKILL } from "@/lib/site";

export default function Home() {
  return (
    <main>
      {/* HERO — the aurora world is the fixed backdrop (App.tsx) */}
      <section className="mx-auto flex min-h-[100svh] max-w-[1320px] flex-col justify-center px-5 pb-16 pt-28 sm:px-8">
        <div className="eyebrow">Project Aurelius · the 3D web skill</div>
        <h1 className="h-display mt-6 text-[clamp(3.2rem,10.5vw,9.5rem)] leading-[0.88]">
          The skill that<br />makes <span className="aurora-text">$10,000</span><br />websites.
        </h1>
        <p className="mt-8 max-w-[600px] text-[18px] leading-relaxed text-fg/70">
          Not templates. Give your AI agent AURA and it directs, builds and QAs immersive, scroll-driven, game-grade 3D sites — products, estates, instruments, portfolios, whole worlds.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link href="/skill" className="btn btn-primary h-[58px] px-9 text-[16px]">Explore the skill →</Link>
          <Link href="/skill#get" className="btn btn-ghost h-[58px] px-7">Get it — {SKILL.priceLabel}</Link>
          <Link href="/request" className="px-2 text-[14px] text-dim underline-offset-4 hover:text-fg hover:underline">Or request a site from me</Link>
        </div>
      </section>

      {/* LIVE PROOF */}
      <section className="relative bg-bg/60 backdrop-blur-sm">
        <div className="mx-auto max-w-[1320px] px-5 pt-24 pb-6 sm:px-8">
          <div className="eyebrow">Built by the skill · live in your browser</div>
          <h2 className="h-display mt-4 text-[clamp(2rem,4.8vw,4.2rem)]">Scroll it. This is the output.</h2>
        </div>
        <LiveWorld initial="halo" scrollVh={560} />
      </section>

      <section className="bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8">
          <Reveal>
            <div className="eyebrow">Twelve art directions</div>
            <h2 className="h-display mt-4 text-[clamp(2rem,4.8vw,4.2rem)]">Product renders. Estates. Instruments. Worlds.</h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
            {DIRECTIONS.map((d) => (
              <Link key={d.n} href="/skill#directions" className="group rounded-2xl border border-line p-4 transition hover:-translate-y-1" style={{ background: `radial-gradient(120% 90% at 85% 0%, ${d.pal[1]}30, transparent 60%), ${d.pal[0]}` }}>
                <div className="font-mono text-[10px] tracking-[0.2em]" style={{ color: d.pal[1] }}>{d.n}</div>
                <div className={`mt-6 font-display text-[16px] font-semibold leading-tight tracking-[-0.03em] ${d.n === "12" ? "text-[#1b1b1b]" : ""}`}>{d.name}</div>
                <div className={`mt-1 text-[11.5px] ${d.n === "12" ? "text-black/55" : "text-dim"}`}>{d.move}</div>
              </Link>
            ))}
          </div>

          <div className="mt-24 grid gap-12 lg:grid-cols-2">
            <Reveal>
              <div className="eyebrow">Taught by example</div>
              <h2 className="h-display mt-4 text-[clamp(1.8rem,3.8vw,3.2rem)]">{SKILL_STATS.examples} worked examples calibrate the agent.</h2>
              <p className="mt-4 max-w-[480px] text-dim">Prompt → direction lock → storyboard → signature move. The agent sees what “$10,000” means before it writes a line.</p>
              <Link href="/skill#examples" className="btn btn-ghost mt-6">See the examples</Link>
            </Reveal>
            <div className="space-y-2">
              {EXAMPLES.slice(0, 5).map((e) => (
                <div key={e.n} className="flex items-center gap-4 rounded-2xl border border-line px-5 py-4"><span className="font-mono text-[11px] text-dim">{e.n}</span><b className="font-display text-[17px]">{e.name}</b><span className="chip">{e.dir}</span><span className="ml-auto hidden text-[12px] text-dim md:block">{e.move}</span></div>
              ))}
            </div>
          </div>

          <div className="mt-24 grid gap-4 md:grid-cols-2">
            <Link href="/skill#get" className="panel group !rounded-[28px] p-8 transition hover:-translate-y-1 sm:p-10"><div className="eyebrow">Do it yourself</div><h3 className="h-display mt-4 text-[clamp(1.8rem,3.4vw,2.8rem)]">Get AURA for {SKILL.priceLabel}</h3><p className="mt-3 text-dim">The skill, the engine, the directions and the examples. Use it on unlimited projects.</p><span className="mt-6 inline-block text-aurora">Get the skill →</span></Link>
            <Link href="/request" className="panel group !rounded-[28px] p-8 transition hover:-translate-y-1 sm:p-10"><div className="eyebrow">Done for you</div><h3 className="h-display mt-4 text-[clamp(1.8rem,3.4vw,2.8rem)]">Request a custom site</h3><p className="mt-3 text-dim">Send a brief. I direct and build it with the skill, then hand-finish it.</p><span className="mt-6 inline-block text-aurora">Request a site →</span></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
