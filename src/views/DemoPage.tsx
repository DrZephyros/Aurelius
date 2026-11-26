"use client";

import { useState } from "react";
import { Link } from "@/lib/router";
import { demoBySlug, downloadDemo, kitFrameProps, kitSource, listFor, openDemoFullscreen, type Kind } from "@/lib/collections";
import { CodeViewer } from "@/components/code-viewer";
import { CopyButton } from "@/components/copy-button";
import { Reveal } from "@/components/reveal";

const DEVICES = { Desktop: "100%", Tablet: "820px", Mobile: "390px" } as const;

export default function DemoPage({ kind, slug }: { kind: Kind; slug: string }) {
  const d = demoBySlug(kind, slug);
  const [device, setDevice] = useState<keyof typeof DEVICES>("Desktop");
  const [nonce, setNonce] = useState(0);
  const root = kind === "page" ? "/pages" : "/elements";
  if (!d) {
    return (
      <main className="mx-auto max-w-[1320px] px-5 pb-28 pt-40 sm:px-8">
        <h1 className="h-display text-[clamp(3rem,8vw,6rem)]">Not found</h1>
        <Link href={root} className="btn btn-primary mt-8">Back to the collection</Link>
      </main>
    );
  }
  const list = listFor(kind);
  const i = list.findIndex((x) => x.slug === slug);
  const prev = list[(i + list.length - 1) % list.length];
  const next = list[(i + 1) % list.length];
  const src = kitSource(kind, slug);
  const kb = Math.max(1, Math.round(new Blob([src]).size / 1024));
  const lines = src.split("\n").length;

  return (
    <main className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] opacity-70" style={{ background: `radial-gradient(60% 70% at 70% 0%, ${d.accent}26, transparent 70%)` }} aria-hidden />
      <div className="relative mx-auto max-w-[1320px] px-5 pb-28 pt-28 sm:px-8">
        <Link href={root} className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] text-dim uppercase hover:text-fg">← {kind === "page" ? "All app pages" : "All interactive elements"}</Link>

        <header className="mt-8 flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">N°{String(i + 1).padStart(2, "0")}</span>
              <span className="chip">{d.category}</span>
              <span className="chip">{d.light ? "Light" : "Dark"} theme</span>
            </div>
            <h1 className="h-display mt-6 text-[clamp(3rem,8vw,7rem)]">{d.name}</h1>
            <p className="mt-4 font-display text-2xl tracking-[-0.02em]" style={{ color: d.accent }}>{d.tagline}</p>
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-dim">{d.blurb}</p>
          </div>
          <div className="flex flex-col gap-3 sm:min-w-[260px]">
            <button type="button" onClick={() => downloadDemo(d)} className="btn btn-primary !h-14 !text-[15px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M12 3v13m0 0 5-5m-5 5-5-5M4 21h16" /></svg>
              Download .html
            </button>
            <button type="button" onClick={() => openDemoFullscreen(d)} className="btn btn-ghost">Open fullscreen ↗</button>
            <p className="text-center font-mono text-[11px] text-dim">{kb} KB · {lines} lines · no dependencies</p>
          </div>
        </header>

        <div className="panel mt-12 overflow-hidden !rounded-[26px] p-2">
          <div className="flex items-center justify-between gap-3 px-3 py-2.5">
            <div className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-white/15" /><i className="size-2.5 rounded-full bg-white/15" /><i className="size-2.5 rounded-full bg-white/15" /></div>
            <div className="hidden max-w-sm flex-1 truncate rounded-full border border-line bg-black/30 px-4 py-1.5 text-center font-mono text-[11px] text-dim sm:block">yoursite.com/{kind === "page" ? d.slug : `playground/${d.slug}`}</div>
            <div className="flex items-center gap-1">
              {(Object.keys(DEVICES) as (keyof typeof DEVICES)[]).map((k) => (
                <button key={k} onClick={() => setDevice(k)} className={`rounded-full px-3 py-1.5 text-xs transition ${device === k ? "bg-white/12 text-fg" : "text-dim hover:text-fg"}`}>{k}</button>
              ))}
              <button onClick={() => setNonce((n) => n + 1)} className="ml-1 rounded-full px-3 py-1.5 text-xs text-dim transition hover:text-fg" title="Restart the demo">↻ Reset</button>
            </div>
          </div>
          <div className="flex justify-center overflow-hidden rounded-[18px] bg-black/50">
            <iframe
              key={nonce}
              {...kitFrameProps({ kind, slug })}
              title={`${d.name} — live`}
              className="h-[min(78vh,780px)] min-h-[520px] border-0 bg-transparent transition-[width] duration-500"
              style={{ width: DEVICES[device], maxWidth: "100%" }}
            />
          </div>
        </div>

        <section className="mt-16 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <div className="panel spot h-full p-8">
              <div className="eyebrow">What&apos;s inside</div>
              <ul className="mt-8 grid gap-x-10 gap-y-3.5 text-[15px] sm:grid-cols-2">
                {d.features.map((x) => (
                  <li key={x} className="flex gap-3"><i className="mt-2 size-1.5 shrink-0 rotate-45" style={{ background: d.accent }} />{x}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={90}>
            <div className="panel spot h-full p-8" style={{ borderColor: `${d.accent}33` }}>
              <div className="eyebrow" style={{ color: d.accent }}>Try this</div>
              <ol className="mt-8 space-y-4">
                {d.tryIt.map((x, k) => (
                  <li key={x} className="flex gap-4 text-[15px]"><span className="font-mono text-xs" style={{ color: d.accent }}>0{k + 1}</span>{x}</li>
                ))}
              </ol>
            </div>
          </Reveal>
        </section>

        <section className="mt-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="eyebrow">Read the source</div>
              <h2 className="h-display mt-5 text-[clamp(2.2rem,4.6vw,4rem)]">One file. No black boxes.</h2>
              <p className="mt-4 max-w-xl text-[15px] text-dim">Copy it into any project. It uses plain HTML, CSS and JavaScript — rename the CSS variables at the top to make it yours.</p>
            </div>
            <CopyButton text={`Use the attached ${d.name} ${kind === "page" ? "page" : "element"} as the base. Keep it dependency-free and keep the CSS variables at the top of <style>. Adapt the copy and colours to: [my brand].`} label="Copy an AI prompt" />
          </div>
          <div className="mt-10"><CodeViewer files={[{ name: `${d.slug}.html`, code: src }]} /></div>
        </section>

        <nav className="mt-24 grid gap-4 sm:grid-cols-2">
          {[{ x: prev, dir: "← Previous" }, { x: next, dir: "Next →" }].map(({ x, dir }) => (
            <Link key={x.slug} href={`${root}/${x.slug}`} className="panel spot group p-7 transition hover:border-line-strong">
              <div className="font-mono text-[11px] tracking-[0.18em] text-dim uppercase">{dir}</div>
              <div className="mt-3 flex items-center justify-between"><span className="h-display text-4xl">{x.name}</span><i className="size-3 rotate-45 transition group-hover:scale-150" style={{ background: x.accent }} /></div>
              <p className="mt-1 text-sm text-dim">{x.tagline}</p>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
