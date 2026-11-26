"use client";

import { Link } from "@/lib/router";
import { Reveal } from "@/components/reveal";
import { LAWS, PHASES, SKILL_STATS } from "@/lib/skill";
import { openSkill } from "@/lib/studio";
import { LiveWorld } from "@/components/live-world";
import { SkillStudio } from "@/components/skill-studio";

/** Home-page doorway into the “Make your own” section — a separate product shelf, not another template. */
export function SkillTeaser() {
  return (
    <>
    <section className="mx-auto max-w-[1320px] px-5 pt-28 pb-12 sm:px-8">
      <Reveal>
        <div className="relative overflow-hidden rounded-[28px] border border-[rgb(92_255_196/0.28)] bg-[linear-gradient(135deg,rgb(8_14_24/0.9),rgb(3_5_11/0.9))] p-8 sm:p-12 lg:p-16">
          {/* a little camera rail */}
          <svg className="pointer-events-none absolute -right-10 -top-6 hidden h-[130%] w-[62%] opacity-90 lg:block" viewBox="0 0 600 500" fill="none" aria-hidden>
            <defs>
              <linearGradient id="rail" x1="0" y1="500" x2="600" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#5cffc4" stopOpacity="0" />
                <stop offset=".5" stopColor="#3de7ff" />
                <stop offset="1" stopColor="#a58bff" />
              </linearGradient>
            </defs>
            <path id="rail-p" d="M10 470C120 430 140 300 250 290S380 380 430 250 520 90 590 40" stroke="url(#rail)" strokeWidth="1.5" strokeDasharray="3 7" />
            {[[10, 470, "01"], [250, 290, "02"], [430, 250, "03"], [590, 40, "04"]].map(([x, y, n]) => (
              <g key={n as string}>
                <circle cx={x as number} cy={y as number} r="5" fill="#03050b" stroke="#5cffc4" />
                <text x={(x as number) + 12} y={(y as number) - 10} fill="#8b9bae" fontSize="11" fontFamily="JetBrains Mono, monospace" letterSpacing="2">SHOT {n}</text>
              </g>
            ))}
            <circle r="7" fill="#5cffc4">
              <animateMotion dur="7s" repeatCount="indefinite" rotate="auto"><mpath href="#rail-p" /></animateMotion>
            </circle>
            <circle r="22" fill="#5cffc4" opacity=".16">
              <animateMotion dur="7s" repeatCount="indefinite"><mpath href="#rail-p" /></animateMotion>
            </circle>
          </svg>

          <div className="relative max-w-[660px]">
            <div className="eyebrow">New · Make your own</div>
            <h2 className="h-display mt-5 text-[clamp(2.4rem,5.6vw,5rem)]">
              Don’t want a template?<br /><span className="aurora-text">Teach an agent to make any.</span>
            </h2>
            <p className="mt-6 max-w-[560px] text-[16px] leading-relaxed text-fg/70">
              Everything above is a finished world. <b className="font-semibold text-fg">AURA</b> is the skill behind worlds like them: a creative doctrine, an {SKILL_STATS.engineLines}-line cinematic camera engine and a 100-point quality gate — packaged so an AI agent can build an immersive, scroll-driven 3D site for <i>any</i> brief.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#studio-inline" onClick={(e) => { e.preventDefault(); document.getElementById("studio-inline")?.scrollIntoView({ behavior: "smooth" }); }} className="btn btn-primary h-[52px] px-7">Brief your own site <span aria-hidden>↓</span></a>
              <button type="button" onClick={() => openSkill()} className="btn btn-ghost h-[52px] px-6">Open Studio <kbd className="ml-1 font-mono text-[10px] text-dim">⌘J</kbd></button>
              <Link href="/skill" className="px-2 text-[13px] text-dim underline-offset-4 hover:text-fg hover:underline">Read the skill</Link>
            </div>
            <dl className="mt-10 flex flex-wrap gap-x-9 gap-y-3 border-t border-white/10 pt-6">
              {([[LAWS.length, "laws"], [PHASES.length, "phases"], [SKILL_STATS.docs, "references"], [SKILL_STATS.files, "files"]] as const).map(([n, l]) => (
                <div key={l}>
                  <dt className="font-display text-2xl font-semibold tracking-[-0.04em]">{n}</dt>
                  <dd className="font-mono text-[10px] tracking-[0.16em] text-dim uppercase">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Reveal>
    </section>

    {/* the proof: the skill's actual output, live — scroll it */}
    <section aria-label="Built by the skill, live" className="relative">
      <div className="mx-auto max-w-[1320px] px-5 pb-8 sm:px-8">
        <div className="eyebrow">Built by the skill · live</div>
        <h3 className="h-display mt-4 text-[clamp(1.8rem,3.6vw,3rem)]">Scroll it. No video, no assets — just the skill’s engine.</h3>
      </div>
      <LiveWorld initial="umbra" scrollVh={460} />
    </section>

    <section id="studio-inline" className="mx-auto max-w-[1320px] scroll-mt-24 px-5 py-24 sm:px-8">
      <Reveal>
        <div className="mb-10 max-w-[760px]">
          <div className="eyebrow">Skill Studio</div>
          <h3 className="h-display mt-4 text-[clamp(2rem,4.4vw,3.8rem)]">Now make <span className="aurora-text">yours.</span></h3>
          <p className="mt-4 text-[15px] leading-relaxed text-fg/70">Describe the site. Get a tailored prompt for any agent, and take the skill with you — all without leaving this page. It follows you everywhere: press ⌘J.</p>
        </div>
        <SkillStudio />
      </Reveal>
    </section>
    </>
  );
}
