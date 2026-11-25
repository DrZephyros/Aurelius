"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "@/lib/router";
import { Reveal } from "@/components/reveal";
import { CopyButton } from "@/components/copy-button";
import ExampleExperience from "../../skill-src/aura-3d-web/starter/src/aura/ExampleExperience";
import {
  ARCHETYPES, FAQ, INSTALLS, KICKOFFS, LAWS, MASTER_PROMPT, PHASES, PILLARS, SHORT_PROMPT, SKILL_FILES, SKILL_STATS,
  buildSinglePrompt, downloadSkill, skillFile, type SkillDownload,
} from "@/lib/skill";

const WRAP = "mx-auto max-w-[1320px] px-5 sm:px-8";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Head({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-12 max-w-[820px]">
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="h-display mt-5 text-[clamp(2.2rem,5.4vw,4.6rem)]">{title}</h2>
      {children && <p className="mt-5 max-w-[640px] text-[16px] leading-relaxed text-fg/70">{children}</p>}
    </div>
  );
}

function Code({ text, label }: { text: string; label?: string }) {
  return (
    <div className="panel overflow-hidden !rounded-2xl !bg-[#090b0f]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
        <span className="truncate font-mono text-[11px] text-dim">{label ?? "copy & paste"}</span>
        <CopyButton text={text} label="Copy" />
      </div>
      <pre className="max-h-[320px] overflow-auto whitespace-pre-wrap px-4 py-4 font-mono text-[12.5px] leading-relaxed text-[#cdd3df]">{text}</pre>
    </div>
  );
}

/* the live proof only boots when it nears the viewport, and tears its WebGL context down when you leave */
function LiveProof() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: "60% 0px 60% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ minHeight: "560vh" }}>
      {on && <ExampleExperience scrollVh={560} />}
    </div>
  );
}

function DownloadCard({ kind, title, sub, cta, primary, meta }: { kind: SkillDownload; title: string; sub: string; cta: string; primary?: boolean; meta: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className={`panel flex flex-col p-6 ${primary ? "!border-[rgb(92_255_196/0.45)] shadow-[0_30px_90px_-40px_rgb(92_255_196/0.5)]" : ""}`}>
      <div className="font-mono text-[10.5px] tracking-[0.2em] text-dim uppercase">{meta}</div>
      <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em]">{title}</h3>
      <p className="mt-2 flex-1 text-[14px] leading-relaxed text-fg/65">{sub}</p>
      <button
        type="button"
        disabled={busy}
        onClick={async () => { setBusy(true); try { await downloadSkill(kind); } finally { setBusy(false); } }}
        className={`btn mt-6 w-full ${primary ? "btn-primary" : "btn-ghost"}`}
      >
        {busy ? "Packing…" : cta} <span aria-hidden>↓</span>
      </button>
    </div>
  );
}

function Explorer() {
  const [path, setPath] = useState("SKILL.md");
  const file = skillFile(path) ?? SKILL_FILES[0];
  const groups = useMemo(() => {
    const g: Record<string, typeof SKILL_FILES> = {};
    SKILL_FILES.forEach((f) => (g[f.group] ||= []).push(f));
    return Object.entries(g);
  }, []);
  const md = file.name.endsWith(".md");
  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <nav className="panel max-h-[680px] overflow-auto p-3" aria-label="Skill files">
        {groups.map(([g, files]) => (
          <div key={g} className="mb-3 last:mb-0">
            <div className="px-2 py-1.5 font-mono text-[10px] tracking-[0.22em] text-aurora uppercase">{g === "root" ? "aura-3d-web/" : `${g}/`}</div>
            {files.map((f) => (
              <button
                key={f.path}
                type="button"
                onClick={() => setPath(f.path)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left font-mono text-[12px] transition ${f.path === file.path ? "bg-white/10 text-fg" : "text-dim hover:bg-white/5 hover:text-fg"}`}
              >
                <span className="truncate">{f.path.startsWith("starter/") ? f.path.replace("starter/", "") : f.name}</span>
                <span className="shrink-0 text-[10px] opacity-60">{f.lines}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="panel overflow-hidden !rounded-2xl !bg-[#090b0f]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2.5">
          <span className="truncate font-mono text-xs text-fg/80">aura-3d-web/{file.path}</span>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[11px] text-dim sm:inline">{file.lines} lines</span>
            <CopyButton text={file.code} label="Copy file" />
          </div>
        </div>
        <pre className={`max-h-[630px] overflow-auto px-5 py-5 font-mono text-[12.5px] leading-[1.65] text-[#cdd3df] ${md ? "whitespace-pre-wrap" : ""}`}>{file.code}</pre>
      </div>
    </div>
  );
}

function Tabs<T extends { id: string; t: string }>({ items, children }: { items: T[]; children: (i: T) => ReactNode }) {
  const [id, setId] = useState(items[0].id);
  const cur = items.find((i) => i.id === id) ?? items[0];
  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2" role="tablist">
        {items.map((i) => (
          <button
            key={i.id}
            role="tab"
            aria-selected={i.id === id}
            type="button"
            onClick={() => setId(i.id)}
            className={`rounded-full border px-4 py-2 text-[13px] transition ${i.id === id ? "border-[rgb(92_255_196/0.6)] bg-aurora/10 text-fg" : "border-line text-dim hover:text-fg"}`}
          >
            {i.t}
          </button>
        ))}
      </div>
      {children(cur)}
    </div>
  );
}

export default function SkillPage() {
  const [open, setOpen] = useState<number | null>(0);
  const nTokens = useMemo(() => Math.round(buildSinglePrompt().length / 4 / 1000), []);

  return (
    <main className="relative">
      {/* ───────── hero ───────── */}
      <section className={`${WRAP} relative flex min-h-[100svh] flex-col justify-end pb-14 pt-36`}>
        <div className="pointer-events-none absolute inset-x-0 top-24 -z-0 select-none overflow-hidden text-center font-display text-[clamp(8rem,34vw,34rem)] font-bold leading-[0.8] tracking-[-0.06em] text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.07)]" aria-hidden>
          AURA
        </div>
        <div className="relative max-w-[980px]">
          <div className="rise eyebrow" style={{ "--d": "100ms" } as CSSProperties}>Make your own · the skill</div>
          <h1 className="rise h-display mt-6 text-[clamp(3rem,8.6vw,8.4rem)]" style={{ "--d": "260ms" } as CSSProperties}>
            Don’t download<br />a website.<br />
            <span className="aurora-text">Teach an agent to build any.</span>
          </h1>
          <p className="rise mt-8 max-w-[620px] text-[17px] leading-relaxed text-fg/75" style={{ "--d": "520ms" } as CSSProperties}>
            A templates shelf answers one brief. <b className="font-semibold text-fg">AURA</b> is the skill that lets an AI agent author a new cinematic, scroll-driven 3D world for <i>any</i> brief — a product, a portfolio, a house, a game, a cause — with a camera engine, a creative method and a quality gate that refuses to ship “just another website”.
          </p>
          <div className="rise mt-9 flex flex-wrap items-center gap-3" style={{ "--d": "700ms" } as CSSProperties}>
            <button type="button" onClick={() => scrollToId("get")} className="btn btn-primary h-[54px] px-8 text-[15px]">Get the skill <span aria-hidden>↓</span></button>
            <button type="button" onClick={() => scrollToId("proof")} className="btn btn-ghost h-[54px] px-7 text-[15px]">Scroll the live engine</button>
            <Link href="/library" className="px-3 text-[14px] text-dim underline-offset-4 transition hover:text-fg hover:underline">or browse ready-made worlds</Link>
          </div>
        </div>
        <dl className="rise relative mt-16 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-6" style={{ "--d": "900ms" } as CSSProperties}>
          {([[LAWS.length, "laws"], [PHASES.length, "phases"], [SKILL_STATS.docs, "deep references"], [SKILL_STATS.engineLines, "lines of engine"], ["100", "point Aura score"], [`~${nTokens}k`, "tokens, all in"]] as const).map(([n, l]) => (
            <div key={l}>
              <dt className="font-display text-3xl font-semibold tracking-[-0.04em]">{n}</dt>
              <dd className="mt-0.5 font-mono text-[10.5px] tracking-[0.16em] text-dim uppercase">{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ───────── why ───────── */}
      <section className={`${WRAP} py-28`}>
        <Head eyebrow="Why a skill" title={<>A template is a fish.<br /><span className="aurora-text">This is the fishing, the boat and the sea.</span></>}>
          Agents already know how to write a webpage — and that is exactly why they all produce the same one. What they lack is taste, a camera, and the discipline to look at their own frames. AURA gives them all three.
        </Head>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["The usual agent", "A centred hero, a spinning cube, gradient blobs, fade-up cards, 200vh of scroll. Technically a “3D website”. Nobody screen-records it.", "text-dim"],
            ["A template", "One brilliant answer to one brief. Perfect until your brief is different — then you are rewriting someone else’s world.", "text-fg/80"],
            ["AURA", "A method that finds the world, a shot-list engine that films it, a visual cookbook that lights it, and a score that must hit 85 before it ships.", "text-aurora"],
          ].map(([t, d, c], i) => (
            <Reveal key={t} delay={i * 90}>
              <div className={`panel h-full p-7 ${i === 2 ? "!border-[rgb(92_255_196/0.4)]" : ""}`}>
                <div className={`font-mono text-[11px] tracking-[0.2em] uppercase ${c}`}>{t}</div>
                <p className="mt-4 text-[15px] leading-relaxed text-fg/70">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid gap-px overflow-hidden rounded-[22px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <div key={p.t} className="bg-bg/90 p-7 backdrop-blur">
              <div className="flex items-baseline justify-between">
                <span className="aurora-text font-display text-7xl font-bold leading-none tracking-[-0.06em]">{p.k}</span>
                <span className="font-mono text-[11px] text-dim">{p.pts} pts</span>
              </div>
              <div className="mt-5 font-display text-xl font-semibold tracking-[-0.03em]">{p.t}</div>
              <p className="mt-2 text-[14px] leading-relaxed text-fg/60">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── live proof ───────── */}
      <section id="proof" className="relative">
        <div className={`${WRAP} pb-10 pt-6`}>
          <Head eyebrow="Proof, not a screenshot" title={<>This is the starter engine.<br />Scroll it.</>}>
            “Obsidian Gate” ships inside the skill: five shots, a hold, a fly-through — zero image assets. One damped playhead drives the camera, the light, the particles and every word on screen. It is the pattern the agent is taught to extend.
          </Head>
        </div>
        <LiveProof />
        <div className={`${WRAP} pt-10`}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-[14px] text-dim">
            <span>Read exactly how it works: <button type="button" className="text-aurora underline-offset-4 hover:underline" onClick={() => scrollToId("pack")}>starter/src/aura/scene.example.ts</button></span>
            <span className="font-mono text-[11px] tracking-[0.16em] uppercase">engine.ts · choreo.ts · materials.ts · particles.ts · layers.ts · floor.ts</span>
          </div>
        </div>
      </section>

      {/* ───────── laws ───────── */}
      <section className={`${WRAP} py-28`}>
        <Head eyebrow="The doctrine" title={<>Ten laws.<br /><span className="aurora-text">None negotiable.</span></>}>
          The first thing the agent reads. Each law exists because its absence is exactly what makes AI-built 3D sites look the way they do.
        </Head>
        <ol className="grid gap-px overflow-hidden rounded-[22px] border border-line bg-line md:grid-cols-2">
          {LAWS.map(([t, d], i) => (
            <li key={t} className="flex gap-5 bg-bg/90 p-6 backdrop-blur">
              <span className="font-mono text-[12px] text-aurora">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div className="font-display text-[19px] font-semibold tracking-[-0.025em]">{t}</div>
                <p className="mt-1.5 text-[14px] leading-relaxed text-fg/60">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────── pipeline ───────── */}
      <section className={`${WRAP} py-28`}>
        <Head eyebrow="The pipeline" title={<>Eight phases.<br />Every one has an exit criterion.</>}>
          The agent can’t skip to the shiny part. It writes a brief, storyboards the film, plans assets, blocks out the camera, lights, then dresses — and only then polishes and scores.
        </Head>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PHASES.map((p, i) => (
            <Reveal key={p.n} delay={(i % 4) * 70}>
              <div className="panel group h-full p-6 transition hover:[border-color:rgb(92_255_196/0.4)]">
                <div className="font-display text-5xl font-bold tracking-[-0.06em] text-white/15 transition group-hover:text-aurora/70">{p.n}</div>
                <div className="mt-4 font-display text-xl font-semibold tracking-[-0.03em]">{p.t}</div>
                <p className="mt-2 text-[13.5px] leading-relaxed text-fg/60">{p.d}</p>
                <div className="mt-5 inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[0.12em] text-aurora uppercase">→ {p.out}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────── archetypes ───────── */}
      <section className={`${WRAP} py-28`}>
        <Head eyebrow="Applicable to anything" title={<>Same engine.<br /><span className="aurora-text">A different world every time.</span></>}>
          Eight playbooks ship in the skill — each with a world metaphor, a chapter skeleton and the one moment worth holding on.
        </Head>
        <Tabs items={ARCHETYPES}>
          {(a) => (
            <div className="panel grid gap-8 p-7 md:grid-cols-[1.1fr_1fr] md:p-10">
              <div>
                <div className="font-mono text-[10.5px] tracking-[0.2em] text-dim uppercase">World metaphor</div>
                <p className="mt-3 font-display text-[clamp(1.5rem,2.6vw,2.2rem)] leading-[1.12] tracking-[-0.03em]">“{a.world}”</p>
                <div className="mt-8 font-mono text-[10.5px] tracking-[0.2em] text-dim uppercase">The hold</div>
                <p className="mt-2 text-[15px] text-fg/75">{a.hold}</p>
              </div>
              <div>
                <div className="font-mono text-[10.5px] tracking-[0.2em] text-dim uppercase">Chapter skeleton</div>
                <ol className="mt-4 space-y-2.5">
                  {a.arc.map((s, i) => (
                    <li key={s} className="flex items-center gap-4">
                      <span className="font-mono text-[11px] text-aurora">{String(i + 1).padStart(2, "0")}</span>
                      <span className="h-px flex-1 max-w-10 bg-white/15" />
                      <span className="text-[14.5px] text-fg/85">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </Tabs>
      </section>

      {/* ───────── pack ───────── */}
      <section id="pack" className={`${WRAP} py-28`}>
        <Head eyebrow="Inside the pack" title={<>{SKILL_STATS.files} files.<br />Read every line.</>}>
          This explorer reads the same files that go into the zip — {SKILL_STATS.docLines.toLocaleString()} lines of doctrine and playbooks, plus {SKILL_STATS.engineLines.toLocaleString()} lines of type-checked engine.
        </Head>
        <Explorer />
      </section>

      {/* ───────── get ───────── */}
      <section id="get" className={`${WRAP} py-28`}>
        <Head eyebrow="Get it" title={<>Hand it to your agent.<br /><span className="aurora-text">Then ask for anything.</span></>}>
          Free to use in unlimited personal and commercial projects. Three formats, same content.
        </Head>
        <div className="grid gap-4 md:grid-cols-3">
          <DownloadCard primary kind="skill" meta="Skills format · recommended" title="Skill folder" sub={`aura-3d-web/ with SKILL.md, ${SKILL_STATS.docs} references, templates, the screenshot script and the starter engine. Works with Claude Code, Claude.ai and any tool that reads a folder.`} cta="Download aura-3d-web.zip" />
          <DownloadCard kind="starter" meta="Vite · React · three" title="Starter kit only" sub="The runnable engine and the Obsidian Gate reference scene as a standalone project: npm i && npm run dev." cta="Download aura-starter.zip" />
          <DownloadCard kind="single" meta="For chat UIs · ~" title="One-file edition" sub={`The entire skill compiled into a single markdown file (~${nTokens}k tokens) for assistants with no skills or file support.`} cta="Download .md" />
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h3 className="font-display text-2xl font-semibold tracking-[-0.03em]">Install it</h3>
            <p className="mt-2 text-[14px] text-fg/60">Pick your agent.</p>
            <div className="mt-6">
              <Tabs items={INSTALLS}>
                {(t) => (
                  <div className="space-y-4">
                    {t.steps.map((s) => (
                      <div key={s.label}>
                        <div className="mb-2 text-[13px] text-fg/70">{s.label}</div>
                        <Code text={s.code} label={t.t} />
                      </div>
                    ))}
                  </div>
                )}
              </Tabs>
            </div>
          </div>
          <div>
            <h3 className="font-display text-2xl font-semibold tracking-[-0.03em]">Then say</h3>
            <p className="mt-2 text-[14px] text-fg/60">The short prompt, once the skill is installed.</p>
            <div className="mt-6 space-y-4">
              <Code text={SHORT_PROMPT} label="short prompt · skill installed" />
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white/[0.02] px-4 py-3">
                <div>
                  <div className="text-[14px] font-medium">No skill support? Master prompt</div>
                  <div className="text-[12.5px] text-dim">A compressed form of the whole doctrine, ~{Math.round(MASTER_PROMPT.length / 4)} tokens.</div>
                </div>
                <CopyButton text={MASTER_PROMPT} label="Copy master prompt" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── kickoff prompts ───────── */}
      <section className={`${WRAP} py-20`}>
        <Head eyebrow="Kickoff prompts" title={<>Pick a brief.<br />Paste. Watch.</>}>
          Each one briefs the agent in the voice of that genre — fill the brackets, nothing else.
        </Head>
        <div className="grid gap-3 md:grid-cols-2">
          {KICKOFFS.map((k) => (
            <details key={k.id} className="panel group p-5 open:!border-[rgb(92_255_196/0.35)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="font-display text-lg font-semibold tracking-[-0.02em]">{k.title}</span>
                <span className="font-mono text-[11px] text-dim transition group-open:rotate-45 group-open:text-aurora">+</span>
              </summary>
              <div className="mt-4"><Code text={k.text} label={`kickoff · ${k.title.toLowerCase()}`} /></div>
            </details>
          ))}
        </div>
      </section>

      {/* ───────── score ───────── */}
      <section className={`${WRAP} py-28`}>
        <Head eyebrow="The gate" title={<>Ships at 85.<br /><span className="aurora-text">Not before.</span></>}>
          The agent screenshots its own film at 12 scroll positions on three viewports, critiques each frame like a hard art director, fixes the lowest-scoring pillar and re-shoots.
        </Head>
        <div className="panel p-7 md:p-10">
          <div className="space-y-5">
            {PILLARS.concat([{ k: "P", t: "Production", d: "Performance, mobile, fallbacks, accessibility.", pts: 15 }]).map((p) => (
              <div key={p.t} className="grid grid-cols-[110px_1fr_48px] items-center gap-4 sm:grid-cols-[160px_1fr_60px]">
                <div className="font-display text-[17px] font-semibold tracking-[-0.02em]">{p.t}</div>
                <div className="h-2 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full rounded-full bg-gradient-to-r from-aurora via-teal to-violet" style={{ width: `${p.pts * 4}%` }} />
                </div>
                <div className="text-right font-mono text-[12px] text-dim">{p.pts}</div>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-[640px] text-[14px] leading-relaxed text-fg/60">
            Below 85 it keeps working. The filled-in scorecard — and the fix applied for every weak category — is part of its final message to you.
          </p>
        </div>
      </section>

      {/* ───────── faq ───────── */}
      <section className={`${WRAP} py-20`}>
        <Head eyebrow="Questions" title="Fair questions." />
        <div className="max-w-[860px] divide-y divide-line border-y border-line">
          {FAQ.map(([q, a], i) => (
            <div key={q}>
              <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-6 py-5 text-left">
                <span className="font-display text-xl font-semibold tracking-[-0.025em]">{q}</span>
                <span className={`font-mono text-aurora transition ${open === i ? "rotate-45" : ""}`}>+</span>
              </button>
              <div className={`grid transition-all duration-500 ${open === i ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]"}`}>
                <p className="overflow-hidden text-[15px] leading-relaxed text-fg/65">{a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── finale ───────── */}
      <section className={`${WRAP} flex min-h-[80svh] flex-col items-center justify-center py-28 text-center`}>
        <div className="eyebrow">Make something that makes people feel it</div>
        <h2 className="h-display mt-6 text-[clamp(3rem,9vw,9rem)]">
          Go make<br /><span className="aurora-text">AURA.</span>
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => scrollToId("get")} className="btn btn-primary h-[54px] px-8 text-[15px]">Get the skill <span aria-hidden>↓</span></button>
          <Link href="/library" className="btn btn-ghost h-[54px] px-7 text-[15px]">Prefer ready-made? Open the library</Link>
        </div>
      </section>
    </main>
  );
}
