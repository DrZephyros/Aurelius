"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "@/lib/router";
import { TEMPLATES, bySlug } from "@/lib/templates";
import { ELEMENTS, PAGES } from "@/lib/collections";
import { ALL_PROMPTS } from "@/lib/library";
import { REG_ITEMS, TEXT_EFFECTS } from "@/lib/registry";
import { metricsFor } from "@/lib/files";
import { Specimen } from "@/components/specimen";
import { frameProps } from "@/lib/demo";
import { CountUp, Reveal } from "@/components/reveal";
import { SHELVES } from "@/components/chrome";
import { SkillTeaser } from "@/views/SkillTeaser";

/* ── scroll-lit paragraph: words ignite as you read ─────────── */
function LitText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const words = useMemo(() => text.split(" ").map((w) => ({ w: w.replace(/\*/g, ""), em: w.includes("*") })), [text]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = [...el.querySelectorAll<HTMLElement>("[data-w]")];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const on = () => {
      const r = el.getBoundingClientRect();
      const k = reduce ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.78 - r.top) / (r.height + innerHeight * 0.1)));
      spans.forEach((s, i) => {
        const lit = Math.min(1, Math.max(0, k * 1.25 * spans.length - i) / 1.5);
        s.style.opacity = String(0.16 + 0.84 * lit);
        if (s.dataset.em) s.style.textShadow = `0 0 ${34 * lit}px rgb(92 255 196 / ${0.55 * lit})`;
      });
    };
    on();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => { removeEventListener("scroll", on); removeEventListener("resize", on); };
  }, [words]);
  return (
    <p ref={ref} className={className}>
      {words.map((x, i) => (
        <span key={i} data-w data-em={x.em ? "1" : undefined} className={`lit-word ${x.em ? "aurora-text" : ""}`} style={{ opacity: 0.16 }}>
          {x.w}{" "}
        </span>
      ))}
    </p>
  );
}

/* ── a card that leans toward the pointer ───────────────────── */
function Tilt({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, transformStyle: "preserve-3d", transition: "transform .6s cubic-bezier(.16,1,.3,1)" }}
      onPointerMove={(e) => {
        if (e.pointerType === "touch") return;
        const el = ref.current!;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transition = "transform .1s linear";
        el.style.transform = `perspective(1100px) rotateY(${x * 9}deg) rotateX(${-y * 8}deg) translateZ(12px)`;
      }}
      onPointerLeave={() => {
        const el = ref.current!;
        el.style.transition = "transform .8s cubic-bezier(.16,1,.3,1)";
        el.style.transform = "perspective(1100px) rotateY(0) rotateX(0)";
      }}
    >
      {children}
    </div>
  );
}

const FEATURED = ["apex", "nebula", "prism"];

const CODE: [string, string][] = [
  ["c", "// public/demos/apex/main.js — the only file you touch"],
  ["", "const CONFIG = {"],
  ["", "  paint:  0x055e5c,   "],
  ["", "  accent: 0x5cffc4,   "],
  ["", "  speed:  26,         "],
  ["", "};"],
];

/** Appears once you start scrolling the story, so the library is always one click away. */
function EnterPill() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const f = () => setOn(scrollY > innerHeight * 0.5);
    f();
    addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, []);
  return (
    <div className={`fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transition duration-700 ${on ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-10 opacity-0"}`}>
      <Link href="/library" className="btn btn-primary h-12 gap-3 px-7 text-[14px] shadow-[0_20px_60px_-10px_rgb(92_255_196/0.55)]">
        Skip to the library <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

/** Warm the specimens up ahead of the reader: once the hero has settled, boot the first world in the background,
 *  then the next one as soon as it reports ready — so every world is already running by the time it is scrolled to. */
function useWarmQueue() {
  const [warm, setWarm] = useState(-1);
  useEffect(() => {
    let cancelled = false;
    const idle = (fn: () => void, timeout: number) =>
      "requestIdleCallback" in window ? (window as Window & { requestIdleCallback: (f: () => void, o: { timeout: number }) => number }).requestIdleCallback(fn, { timeout }) : setTimeout(fn, 200);
    // let the hero's entrance play first, then assemble the documents (blob urls + importmaps) off the critical path
    const t = setTimeout(() => {
      idle(() => {
        if (cancelled) return;
        FEATURED.forEach((slug) => frameProps(slug, "embed=scroll"));
        setWarm(0);
      }, 2500);
    }, 700);
    return () => { cancelled = true; clearTimeout(t); };
  }, []);
  const ready = useMemo(() => FEATURED.map((_, i) => () => setWarm((w) => Math.max(w, i + 1))), []);
  return { warm, ready };
}

export default function Home() {
  const { warm, ready } = useWarmQueue();
  const avgTokens = useMemo(() => Math.round(TEMPLATES.reduce((a, t) => a + metricsFor(t.slug).tokens, 0) / TEMPLATES.length / 1000), []);

  return (
    <main>
      <EnterPill />
      {/* ───────────── ACT I · hero ───────────── */}
      <section className="relative mx-auto flex min-h-[100svh] max-w-[1320px] flex-col justify-end px-5 pb-12 pt-32 sm:px-8">
        <div className="max-w-[860px]">
          <div className="rise eyebrow" style={{ "--d": "200ms" } as CSSProperties}>Project Aurelius · 3D for vibecoders</div>
          <h1 className="rise h-display mt-6 text-[clamp(3.2rem,9.4vw,9.2rem)]" style={{ "--d": "380ms" } as CSSProperties}>
            Vibecode the<br />
            <span className="aurora-text">next dimension.</span>
          </h1>
          <p className="rise mt-7 max-w-[560px] text-[17px] leading-relaxed text-fg/75" style={{ "--d": "620ms" } as CSSProperties}>
            A library of cinematic, scroll-driven 3D websites — already written, tested and debugged. Download the code, change a few lines, and ship something that stops people mid-scroll.
          </p>
          <div className="rise mt-9 flex flex-wrap items-center gap-3" style={{ "--d": "820ms" } as CSSProperties}>
            <Link href="/library" className="btn btn-primary h-[54px] px-8 text-[15px]">Enter the library <span aria-hidden>→</span></Link>
            <a href="#manifesto" onClick={(e) => { e.preventDefault(); document.getElementById("manifesto")?.scrollIntoView({ behavior: "smooth" }); }} className="btn btn-ghost h-[54px] px-7 text-[15px]">Follow the light</a>
          </div>
          {/* one click to any shelf — no detours */}
          <div className="rise mt-6 flex flex-wrap items-center gap-2" style={{ "--d": "980ms" } as CSSProperties}>
            <span className="mr-1 font-mono text-[10.5px] tracking-[0.18em] text-dim uppercase">Jump straight to</span>
            {([["Make your own", "/make-your-own"], ["Landing pages", "/landing-pages"], ["Components", "/components"], ["Text effects", "/text-effects"], ["App pages", "/pages"], ["Prompts", "/prompts"]] as const).map(([l, h]) => (
              <Link key={h} href={h} className="glass rounded-full px-3.5 py-1.5 text-[12.5px] text-fg/80 transition hover:text-fg hover:[border-color:rgb(92_255_196/0.55)]">{l}</Link>
            ))}
          </div>
        </div>

        <div className="rise mt-16 flex items-end justify-between gap-6 border-t border-white/10 pt-6" style={{ "--d": "1100ms" } as CSSProperties}>
          <dl className="flex flex-wrap gap-x-10 gap-y-4">
            {([[TEMPLATES.length, "3D worlds"], [PAGES.length, "app pages"], [REG_ITEMS.filter((i) => i.category !== TEXT_EFFECTS).length, "components"], [REG_ITEMS.filter((i) => i.category === TEXT_EFFECTS).length, "text effects"], [ELEMENTS.length, "elements"], [ALL_PROMPTS.length, "prompts"]] as const).map(([n, l]) => (
              <div key={l}>
                <dt className="font-display text-3xl font-semibold tracking-[-0.04em]">{n}</dt>
                <dd className="mt-0.5 font-mono text-[10.5px] tracking-[0.16em] text-dim uppercase">{l}</dd>
              </div>
            ))}
          </dl>
          <div className="hidden items-center gap-3 font-mono text-[10.5px] tracking-[0.3em] text-dim uppercase sm:flex">
            Scroll
            <span className="relative block h-10 w-px overflow-hidden bg-white/15"><i className="absolute inset-x-0 top-0 h-4 bg-aurora" style={{ animation: "scroll-cue 2s ease-in-out infinite" }} /></span>
          </div>
        </div>
      </section>

      {/* ───────────── ACT II · manifesto ───────────── */}
      <section id="manifesto" className="mx-auto flex min-h-[90svh] max-w-[1320px] items-center px-5 py-32 sm:px-8">
        <div className="max-w-[1080px]">
          <div className="eyebrow mb-8">The idea</div>
          <LitText
            className="font-display text-[clamp(2rem,5.2vw,4.9rem)] font-semibold leading-[1.04] tracking-[-0.04em]"
            text="You shouldn't need forty prompts to make a website feel *alive.* The shaders, camera rails and layouts are already written. You bring the *idea* — we bring the *light.*"
          />
        </div>
      </section>

      {/* ───────────── ACT III · specimens ───────────── */}
      <section className="mx-auto max-w-[1320px] px-5 py-28 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <div className="eyebrow">Specimens</div>
              <h2 className="h-display mt-5 text-[clamp(2.4rem,5.4vw,5rem)]">Not screenshots.<br /><span className="aurora-text">The real thing, running.</span></h2>
            </div>
            <Link href="/landing-pages" className="btn btn-ghost">See all {TEMPLATES.length} worlds <span aria-hidden>→</span></Link>
          </div>
        </Reveal>

        <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-dim">
          No sliders, no thumbnails. Each world below is the actual template, running inside this page — keep scrolling and you move through the whole thing, top to footer, before the next one begins.
        </p>
      </section>

      {/* the three specimens run full-bleed: scrolling the page IS scrolling the template */}
      <div className="relative">
        {FEATURED.map((slug, i) => {
          const t = bySlug(slug)!;
          return <Specimen key={slug} t={t} index={i} total={FEATURED.length} load={warm >= i} onReady={ready[i]} />;
        })}
      </div>

      <section className="mx-auto max-w-[1320px] px-5 pb-6 pt-16 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8">
          <div className="text-[15px] text-dim">That was three of {TEMPLATES.length}. The rest are one click away.</div>
          <Link href="/landing-pages" className="btn btn-ghost">See all {TEMPLATES.length} worlds <span aria-hidden>→</span></Link>
        </div>
      </section>

      <SkillTeaser />

      {/* ───────────── ACT IV · anatomy ───────────── */}
      <section className="mx-auto max-w-[1320px] px-5 py-28 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
          <Reveal>
            <div className="eyebrow">Anatomy of a world</div>
            <h2 className="h-display mt-5 text-[clamp(2.4rem,5vw,4.6rem)]">Three moves.<br />Idea to <span className="gold-text">live.</span></h2>
            <ol className="mt-10 space-y-7">
              {[
                ["Pick a world", "Browse the library. Every card runs the actual template, live."],
                ["Change a few lines", "A CONFIG object, a handful of CSS variables and your copy. That's the entire job."],
                ["Ship it", "Plain HTML, CSS and JS with Three.js vendored in. No build step. Any static host."],
              ].map(([h, d], i) => (
                <li key={h} className="flex gap-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong font-mono text-xs text-aurora">0{i + 1}</span>
                  <div>
                    <div className="font-display text-xl font-semibold tracking-[-0.02em]">{h}</div>
                    <p className="mt-1.5 max-w-md text-[14.5px] leading-relaxed text-dim">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={150}>
            <Tilt className="glass overflow-hidden rounded-[26px]">
              <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
                <i className="size-2.5 rounded-full bg-rose/70" /><i className="size-2.5 rounded-full bg-gold/70" /><i className="size-2.5 rounded-full bg-aurora/70" />
                <span className="ml-3 font-mono text-[11px] text-dim">main.js</span>
              </div>
              <pre className="code overflow-x-auto p-6">
                {CODE.map(([k, l], i) => (
                  <div key={i} className={k === "c" ? "tok-c" : ""}>
                    {k === "c" ? l : l.includes("0x") ? (
                      <>
                        <span className="text-dim">{l.split(":")[0]}:</span>
                        <span className="tok-n">{l.split(":")[1].replace(/\s+$/, "")}</span>
                        <span className="tok-c">  {l.includes("paint") ? "// body colour" : "// lights, streaks, UI"}</span>
                      </>
                    ) : l.includes("speed") ? (
                      <>
                        <span className="text-dim">  speed:</span><span className="tok-n">  26,</span><span className="tok-c">  // world speed</span>
                      </>
                    ) : l}
                  </div>
                ))}
              </pre>
              <div className="grid grid-cols-3 border-t border-line">
                {([[avgTokens, "k", "tokens saved per world"], [0, "", "AI calls at runtime"], [24, "", "worlds to start from"]] as const).map(([n, s, l], i) => (
                  <div key={l} className={`px-5 py-5 ${i ? "border-l border-line" : ""}`}>
                    <div className="font-display text-3xl font-semibold tracking-[-0.04em]">{n === 24 ? <CountUp to={TEMPLATES.length} /> : <CountUp to={n} suffix={s} />}</div>
                    <div className="mt-1 font-mono text-[10px] tracking-[0.14em] text-dim uppercase">{l}</div>
                  </div>
                ))}
              </div>
            </Tilt>
          </Reveal>
        </div>
      </section>

      {/* ───────────── ACT V · the portal ───────────── */}
      <section className="mx-auto flex min-h-[100svh] max-w-[1320px] flex-col items-center justify-center px-5 py-32 text-center sm:px-8">
        <Reveal>
          <div className="eyebrow justify-center">Your turn</div>
          <h2 className="h-display mx-auto mt-6 max-w-[11ch] text-[clamp(3rem,9vw,8.6rem)]">Step into the <span className="gold-text">library.</span></h2>
          <p className="mx-auto mt-6 max-w-lg text-[17px] leading-relaxed text-fg/70">Worlds, app screens, drop-in components, text effects, prompts and immersive bundles — one place, every shelf.</p>
          <div className="mt-10"><Link href="/library" className="btn btn-primary h-[58px] px-10 text-base">Enter the library <span aria-hidden>→</span></Link></div>
          <div className="mt-12 flex flex-wrap justify-center gap-2">
            {SHELVES.map((s) => (
              <Link key={s.href} href={s.href} className="glass rounded-full px-5 py-2.5 text-[13px] text-dim transition hover:text-fg hover:[border-color:rgb(92_255_196/0.5)]">{s.label}</Link>
            ))}
          </div>
        </Reveal>
      </section>
    </main>
  );
}
