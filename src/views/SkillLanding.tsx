"use client";

import { useState } from "react";
import { Link } from "@/lib/router";
import { Reveal } from "@/components/reveal";
import { LiveWorld } from "@/components/live-world";
import { SkillStudio } from "@/components/skill-studio";
import { DIRECTIONS, EXAMPLES, FAQ, INSTALLS, LAWS, PHASES, PILLARS, SKILL_FILES, SKILL_STATS, skillFile } from "@/lib/skill";
import { SKILL } from "@/lib/site";

const COMPARE: [string, string, string][] = [
  ["The idea", "A spinning cube, a gradient, fade-up cards", "One authored world and one camera. Scroll is the playhead"],
  ["Look", "Default lights, no environment map, flat materials", "Key / rim / fill / practical, a designed environment map, matter with a story"],
  ["Depth", "One plane", "Five depth planes in every frame — occluder, subject, mid, back, atmosphere"],
  ["Type", "Inter 64px, centred", "Giant fitted type the world occludes, reflects and lights"],
  ["Quality bar", "“Looks good”", "12 frames × 3 viewports, 100-point score, three polish loops"],
  ["Delivery", "A hero section", "Hero film + end-state + routes + metadata + mobile edit + hand-off"],
];

const INCLUDED = [
  `${SKILL_STATS.docs} deep references — doctrine, choreography, visual engine, assets, type, performance, QA, frontier techniques`,
  "12 art directions with signature moves, palettes, camera personalities and build recipes",
  `${SKILL_STATS.examples} worked examples: prompt → direction lock → storyboard → implementation`,
  `A ${SKILL_STATS.engineLines}-line cinematic engine (damped playhead, camera rail, post stack, adaptive quality)`,
  "Four finished reference worlds — object, event, product altar, and a Folio portfolio — plus studio light, asteroid ground and hero-object builders",
  "A QA gate script: deterministic scroll seeks, contact sheets, collision lint, no-WebGL and reduced-motion tests",
  "Works as a Claude skill, a Cursor rule, an AGENTS.md include — or a single-file prompt for any chat",
  "Free updates to every 2.x release",
];

function Sample() {
  const samples = ["references/01-aura-doctrine.md", "examples/01-nocta-earbuds-product.md", "references/09-prompt-pack.md"].map((p) => skillFile(p)).filter((f) => f && f.code);
  const [i, setI] = useState(0);
  const f = samples[i];
  if (!f) return null;
  return (
    <div className="panel overflow-hidden !rounded-[22px]">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-black/30 p-3">
        <span className="chip">Free sample</span>
        {samples.map((s, k) => (
          <button key={s!.path} type="button" onClick={() => setI(k)} aria-pressed={k === i} className={`rounded-full px-3 py-1.5 font-mono text-[11px] transition ${k === i ? "bg-white/14 text-fg" : "text-dim hover:text-fg"}`}>{s!.name}</button>
        ))}
      </div>
      <pre className="max-h-[420px] overflow-auto p-5 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-fg/80">{f.code}</pre>
    </div>
  );
}

export default function SkillLanding({ embedded = false }: { embedded?: boolean }) {
  const groups: Record<string, typeof SKILL_FILES> = {};
  SKILL_FILES.forEach((f) => (groups[f.group] ||= []).push(f));
  const order = ["root", "references", "examples", "templates", "scripts", "starter"];
  const [inst, setInst] = useState(INSTALLS[0].id);
  const ins = INSTALLS.find((x) => x.id === inst)!;

  return (
    <main className="relative">
      {!embedded && (<>
      {/* HERO */}
      <section className="mx-auto max-w-[1320px] px-5 pb-16 pt-36 sm:px-8 sm:pt-44">
        <div className="eyebrow">AURA {SKILL.version} · agent skill for Claude, Codex, Cursor</div>
        <h1 className="h-display mt-6 text-[clamp(3rem,9vw,8.2rem)] leading-[0.9]">
          Stop asking AI<br />for “a 3D website”.<br /><span className="aurora-text">Hire the art director.</span>
        </h1>
        <p className="mt-8 max-w-[640px] text-[18px] leading-relaxed text-fg/70">
          AURA is a skill you give your AI agent. It makes the agent <b className="text-fg">direct, build and QA</b> scroll-driven, game-grade 3D websites — product renders, estates, instruments, portfolios, whole worlds — to a <b className="text-fg">$10,000 standard</b>, for any brand, from one prompt.
        </p>
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="/services#skill-pricing" className="btn btn-primary h-[56px] px-8 text-[16px]">Get the skill — {SKILL.priceLabel}</Link>
          <Link href="/services#worlds" className="btn btn-ghost h-[56px] px-7">See what it makes ↓</Link>
          <Link href="/services#build" className="px-2 text-[14px] text-dim underline-offset-4 hover:text-fg hover:underline">Rather have me build it? Request a site</Link>
        </div>
        <dl className="mt-14 grid max-w-[900px] grid-cols-2 gap-6 border-t border-line pt-8 sm:grid-cols-5">
          {([[DIRECTIONS.length, "art directions"], [SKILL_STATS.docs, "references"], [SKILL_STATS.examples, "worked examples"], [SKILL_STATS.engineLines, "engine lines"], [SKILL_STATS.kb + " KB", "of craft"]] as const).map(([n, l]) => (
            <div key={l}><dt className="font-display text-3xl font-semibold tracking-[-0.04em]">{n}</dt><dd className="mt-1 font-mono text-[10px] tracking-[0.16em] text-dim uppercase">{l}</dd></div>
          ))}
        </dl>
      </section>

      </>)}

      {/* LIVE */}
      <section id="worlds" className="relative scroll-mt-24">
        <div className="mx-auto max-w-[1320px] px-5 pb-6 sm:px-8">
          <div className="eyebrow">Output of the skill's starter · live</div>
          <h2 className="h-display mt-4 text-[clamp(2rem,4.6vw,4rem)]">Scroll it. Nothing here is a video.</h2>
          <p className="mt-3 max-w-[560px] text-dim">Four of the reference worlds that ship in the starter — zero downloaded assets, real-time, scrubbed by your scroll wheel. Switch worlds with the pill — the first is the Folio.</p>
        </div>
        <LiveWorld initial="folio" scrollVh={620} />
      </section>

      {/* COMPARE */}
      <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8">
        <Reveal><div className="eyebrow">The difference</div><h2 className="h-display mt-4 text-[clamp(2rem,4.6vw,4rem)]">Asking an AI vs. giving it AURA.</h2></Reveal>
        <div className="panel mt-10 overflow-hidden !rounded-[24px]">
          <div className="grid grid-cols-[0.7fr_1fr_1.3fr] border-b border-line bg-black/30 px-5 py-3 font-mono text-[10.5px] tracking-[0.18em] text-dim uppercase"><span /><span>Just asking</span><span className="text-aurora">With AURA</span></div>
          {COMPARE.map(([a, b, c]) => (
            <div key={a} className="grid grid-cols-1 gap-1 border-b border-line px-5 py-4 last:border-0 sm:grid-cols-[0.7fr_1fr_1.3fr] sm:gap-4">
              <span className="font-display text-[15px] font-semibold">{a}</span>
              <span className="text-[14px] text-dim line-through decoration-white/20">{b}</span>
              <span className="text-[14px] text-fg/90">{c}</span>
            </div>
          ))}
        </div>
      </section>

      {/* DIRECTIONS */}
      <section id="directions" className="mx-auto max-w-[1320px] scroll-mt-24 px-5 pb-24 sm:px-8">
        <Reveal><div className="eyebrow">Not just architecture</div><h2 className="h-display mt-4 text-[clamp(2rem,4.6vw,4rem)]">Twelve art directions.<br /><span className="text-dim">One is yours.</span></h2>
          <p className="mt-4 max-w-[620px] text-dim">Before it writes a line of code, the agent must choose a lane — and a <i>named signature move</i>. That single rule is what separates a $10,000 site from a tech demo.</p></Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DIRECTIONS.map((d, i) => (
            <Reveal key={d.n} delay={(i % 3) * 0.05}>
              <article className="panel spot group relative h-full overflow-hidden !rounded-[22px] p-6 transition hover:-translate-y-1" style={{ background: `radial-gradient(120% 90% at 85% 0%, ${d.pal[1]}33, transparent 60%), linear-gradient(160deg, ${d.pal[0]}, ${d.pal[0]}ee)` }}>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[11px] tracking-[0.2em]" style={{ color: d.pal[1] }}>N°{d.n}</span>
                  <span className="flex gap-1.5">{d.pal.map((c) => <i key={c} className="size-3 rounded-full border border-white/20" style={{ background: c }} />)}</span>
                </div>
                <h3 className={`mt-8 font-display text-[26px] font-semibold tracking-[-0.04em] ${d.n === "12" ? "text-[#1b1b1b]" : ""}`}>{d.name}</h3>
                <p className={`mt-2 text-[14px] leading-snug ${d.n === "12" ? "text-black/65" : "text-fg/65"}`}>{d.feels}</p>
                <div className={`mt-5 border-t pt-4 text-[12px] ${d.n === "12" ? "border-black/10 text-black/60" : "border-white/10 text-dim"}`}>
                  <div><b className={d.n === "12" ? "text-black/80" : "text-fg/80"}>Signature</b> · {d.move}</div>
                  <div className="mt-1"><b className={d.n === "12" ? "text-black/80" : "text-fg/80"}>Best for</b> · {d.best}</div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* EXAMPLES */}
      <section id="examples" className="mx-auto max-w-[1320px] scroll-mt-24 px-5 pb-24 sm:px-8">
        <Reveal><div className="eyebrow">Teaches the agent what you want</div><h2 className="h-display mt-4 text-[clamp(2rem,4.6vw,4rem)]">Seven worked examples.</h2>
          <p className="mt-4 max-w-[620px] text-dim">Each one is a real prompt, the direction lock the agent writes, a scroll-range storyboard and implementation notes. Agents learn by calibration — these set the bar.</p></Reveal>
        <div className="mt-10 grid gap-3 md:grid-cols-2">
          {EXAMPLES.map((e) => (
            <Reveal key={e.n}>
              <div className="panel flex gap-5 !rounded-[20px] p-5">
                <span className="font-display text-4xl font-semibold tracking-[-0.05em] text-dim/50">{e.n}</span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-display text-[19px] font-semibold tracking-[-0.03em]">{e.name}</h3><span className="chip">{e.dir}</span></div>
                  <p className="mt-2 text-[14px] text-fg/70">“{e.prompt}”</p>
                  <p className="mt-2 font-mono text-[11px] tracking-[0.1em] text-aurora uppercase">→ {e.move}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PIPELINE */}
      <section className="mx-auto max-w-[1320px] px-5 pb-24 sm:px-8">
        <Reveal><div className="eyebrow">The pipeline</div><h2 className="h-display mt-4 text-[clamp(2rem,4.6vw,4rem)]">Eight phases. Each has an exit criterion.</h2></Reveal>
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PHASES.map((p) => (
            <li key={p.n} className="panel !rounded-[20px] p-5">
              <div className="font-mono text-[11px] tracking-[0.2em] text-aurora">{p.n}</div>
              <h3 className="mt-3 font-display text-[20px] font-semibold tracking-[-0.03em]">{p.t}</h3>
              <p className="mt-2 text-[13.5px] leading-snug text-dim">{p.d}</p>
              <div className="mt-4 font-mono text-[10px] tracking-[0.14em] text-fg/50 uppercase">→ {p.out}</div>
            </li>
          ))}
        </ol>
        <div className="mt-8 grid gap-3 sm:grid-cols-4">
          {PILLARS.map((p) => (
            <div key={p.t} className="rounded-2xl border border-line p-4"><div className="flex items-baseline justify-between"><b className="font-display text-xl">{p.k} · {p.t}</b><span className="font-mono text-[11px] text-dim">{p.pts} pts</span></div><p className="mt-1 text-[13px] text-dim">{p.d}</p></div>
          ))}
        </div>
      </section>

      {/* LAWS */}
      <section className="mx-auto max-w-[1320px] px-5 pb-24 sm:px-8">
        <Reveal><div className="eyebrow">Ten laws</div><h2 className="h-display mt-4 text-[clamp(2rem,4.6vw,4rem)]">The taste, written down.</h2></Reveal>
        <div className="mt-8 grid gap-x-10 sm:grid-cols-2">
          {LAWS.map(([t, d], i) => (
            <div key={t} className="flex gap-4 border-t border-line py-4"><span className="font-mono text-[11px] text-aurora">{String(i + 1).padStart(2, "0")}</span><div><b className="font-display text-[17px]">{t}</b><p className="text-[13.5px] text-dim">{d}</p></div></div>
          ))}
        </div>
      </section>

      {/* INSIDE */}
      <section className="mx-auto max-w-[1320px] px-5 pb-24 sm:px-8">
        <Reveal><div className="eyebrow">What's inside</div><h2 className="h-display mt-4 text-[clamp(2rem,4.6vw,4rem)]">{SKILL_STATS.files} files. {SKILL_STATS.kb} KB. Zero filler.</h2></Reveal>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="panel max-h-[560px] overflow-auto !rounded-[22px] p-4 font-mono text-[12px]">
            {order.filter((g) => groups[g]).map((g) => (
              <div key={g} className="mb-3">
                <div className="px-2 py-1 text-[10px] tracking-[0.2em] text-aurora uppercase">{g === "root" ? "/" : g + "/"}</div>
                {groups[g].map((f) => (
                  <div key={f.path} className="flex items-center justify-between gap-3 rounded-lg px-2 py-1 hover:bg-white/5">
                    <span className="truncate text-fg/80">{f.locked ? "🔒" : "✓"} {f.path.replace(g + "/", "")}</span>
                    <span className="shrink-0 text-dim">{f.lines}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <Sample />
        </div>
      </section>

      {/* BRIEF COMPOSER */}
      <section id="studio-inline" className="mx-auto max-w-[1320px] scroll-mt-24 px-5 pb-24 sm:px-8">
        <Reveal><div className="eyebrow">Free · Brief composer</div><h2 className="h-display mt-4 text-[clamp(2rem,4.6vw,4rem)]">Compose your kickoff prompt.</h2>
          <p className="mt-3 max-w-[560px] text-dim">Describe the site; get a ready-to-paste prompt tuned for the skill. Try it before you buy.</p></Reveal>
        <div className="mt-8"><SkillStudio layout="split" /></div>
      </section>

      {!embedded && (<>
      {/* GET */}
      <section id="get" className="mx-auto max-w-[1320px] scroll-mt-24 px-5 pb-24 sm:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-[rgb(92_255_196/0.3)] bg-[linear-gradient(135deg,rgb(8_16_26/0.95),rgb(3_5_11/0.95))] p-8 sm:p-12 lg:p-16">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <div className="eyebrow">One price. Yours forever.</div>
              <h2 className="h-display mt-4 text-[clamp(2.2rem,5vw,4.4rem)]">A $10,000 website<br />for <span className="aurora-text">{SKILL.priceLabel}</span>.</h2>
              <ul className="mt-8 space-y-3">
                {INCLUDED.map((t) => (<li key={t} className="flex gap-3 text-[14.5px] text-fg/80"><span className="mt-0.5 text-aurora">✦</span>{t}</li>))}
              </ul>
            </div>
            <div className="self-center rounded-3xl border border-line bg-black/40 p-7 backdrop-blur-xl">
              <div className="flex items-end gap-2"><span className="font-display text-7xl font-semibold tracking-[-0.06em]">{SKILL.priceLabel}</span><span className="pb-3 font-mono text-[11px] tracking-[0.16em] text-dim uppercase">one-time</span></div>
              <p className="mt-2 text-[13.5px] text-dim">Instant download · skill folder, single-file edition and starter engine · use on unlimited projects.</p>
              <Link href="/skill/checkout" className="btn btn-primary mt-6 h-[58px] w-full text-[16px]">Get AURA — {SKILL.priceLabel}</Link>
              <div className="my-5 flex items-center gap-3 text-[11px] text-dim"><i className="h-px flex-1 bg-line" />or<i className="h-px flex-1 bg-line" /></div>
              <Link href="/services#build" className="btn btn-ghost h-[52px] w-full">Request a custom site from me</Link>
              <p className="mt-4 text-center text-[11.5px] text-dim">Secure checkout · Works with Claude, Codex, Cursor, Gemini, Copilot, Windsurf</p>
            </div>
          </div>
        </div>
      </section>

      </>)}

      {/* INSTALL */}
      <section className="mx-auto max-w-[1320px] px-5 pb-24 sm:px-8">
        <Reveal><div className="eyebrow">After you download</div><h2 className="h-display mt-4 text-[clamp(1.8rem,3.6vw,3rem)]">Installs in one minute.</h2></Reveal>
        <div className="mt-6 flex flex-wrap gap-2">{INSTALLS.map((x) => (<button key={x.id} type="button" onClick={() => setInst(x.id)} aria-pressed={x.id === inst} className={`rounded-full border px-4 py-2 text-[13px] transition ${x.id === inst ? "border-transparent bg-white text-black" : "border-line text-dim hover:text-fg"}`}>{x.t}</button>))}</div>
        <div className="mt-5 space-y-3">{ins.steps.map((s) => (<div key={s.label} className="panel !rounded-2xl p-4"><div className="text-[12.5px] text-dim">{s.label}</div><pre className="mt-2 overflow-x-auto font-mono text-[12px] whitespace-pre-wrap text-fg/85">{s.code}</pre></div>))}</div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-[900px] scroll-mt-24 px-5 pb-28 sm:px-8">
        <Reveal><div className="eyebrow">FAQ</div><h2 className="h-display mt-4 text-[clamp(1.8rem,3.6vw,3rem)]">Questions.</h2></Reveal>
        <div className="mt-6">
          {FAQ.map(([q, a]) => (<details key={q} className="group border-t border-line py-4"><summary className="flex cursor-pointer list-none items-center justify-between font-display text-[18px] font-semibold tracking-[-0.02em]">{q}<span className="text-aurora transition group-open:rotate-45">+</span></summary><p className="mt-3 text-[14.5px] leading-relaxed text-dim">{a}</p></details>))}
          <details className="group border-y border-line py-4"><summary className="flex cursor-pointer list-none items-center justify-between font-display text-[18px] font-semibold tracking-[-0.02em]">Can I just hire you to build it?<span className="text-aurora transition group-open:rotate-45">+</span></summary><p className="mt-3 text-[14.5px] leading-relaxed text-dim">Yes — <Link href="/services#build" className="text-aurora underline-offset-4 hover:underline">send a request</Link> with your brief, budget and timeline. Custom builds use this exact skill plus hand-finishing.</p></details>
        </div>
      </section>
    </main>
  );
}
