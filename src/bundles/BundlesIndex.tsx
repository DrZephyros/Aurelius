"use client";

import type { CSSProperties } from "react";
import { Link } from "@/lib/router";
import { Reveal } from "@/components/reveal";
import { BUNDLES, PAGE_KEYS, type Bundle } from "./data";
import { downloadBundle } from "./download";

/* Hand-drawn SVG posters — no WebGL context needed on the index. */
function Poster({ slug }: { slug: string }) {
  if (slug === "yoru") {
    return (
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <linearGradient id="py" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05030c" /><stop offset=".7" stopColor="#3a0f22" /><stop offset="1" stopColor="#7a1d2a" /></linearGradient>
          <radialGradient id="pm"><stop offset="0" stopColor="#ff6a50" stopOpacity=".7" /><stop offset="1" stopColor="#ff6a50" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width="400" height="250" fill="url(#py)" />
        <circle cx="250" cy="82" r="86" fill="url(#pm)" /><circle cx="250" cy="82" r="30" fill="#ff5e48" />
        <path d="M0 190 L60 150 L110 178 L190 128 L260 172 L330 138 L400 176 V250 H0Z" fill="#2a0d26" opacity=".9" />
        <path d="M0 215 L80 180 L150 205 L240 160 L320 200 L400 170 V250 H0Z" fill="#14081c" />
        <path d="M150 250 L188 120 H212 L250 250Z" fill="#241826" />
        {[0, 1, 2, 3, 4].map((i) => {
          const y = 232 - i * 21, w = 44 - i * 7, s = 1 - i * 0.12;
          return (
            <g key={i} fill="#d4232d" transform={`translate(200 ${y}) scale(${s})`}>
              <rect x={-w / 2} y="-30" width="4" height="30" /><rect x={w / 2 - 4} y="-30" width="4" height="30" />
              <rect x={-w / 2 - 6} y="-34" width={w + 12} height="5" /><rect x={-w / 2 + 2} y="-24" width={w - 4} height="3" />
            </g>
          );
        })}
        {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={(i * 97) % 400} cy={(i * 53) % 150} r={(i % 3) * 0.6 + 0.6} fill="#ffb3c4" opacity=".65" />)}
      </svg>
    );
  }
  if (slug === "helm") {
    return (
      <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <radialGradient id="ph" cx=".5" cy=".5" r=".7"><stop offset="0" stopColor="#0d3043" /><stop offset="1" stopColor="#02060a" /></radialGradient>
          <radialGradient id="pg"><stop offset="0" stopColor="#ffa94d" stopOpacity=".45" /><stop offset="1" stopColor="#ffa94d" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width="400" height="250" fill="url(#ph)" />
        <circle cx="270" cy="125" r="150" fill="url(#pg)" />
        <g transform="translate(200 125)">
          <circle r="104" fill="none" stroke="#9aa1ab" strokeWidth="8" />
          <circle r="96" fill="#07131c" />
          <circle r="86" fill="none" stroke="#ffa94d" strokeWidth="9" strokeDasharray="1.2 1.35" pathLength="360" opacity=".95" strokeDashoffset="0" />
          <circle r="86" fill="none" stroke="#07131c" strokeWidth="11" strokeDasharray="120 240" pathLength="360" strokeDashoffset="-300" />
          <circle r="70" fill="none" stroke="#eef4f7" strokeOpacity=".15" />
          {[0, 90, 180, 270].map((a, i) => <text key={a} transform={`rotate(${a}) translate(0 -58)`} textAnchor="middle" dominantBaseline="middle" fontSize="19" fontWeight="700" fill={i === 0 ? "#ffa94d" : "#eef4f7"}>{"NESW"[i]}</text>)}
          <circle r="32" fill="#10202b" stroke="#9aa1ab" strokeWidth="2" />
          <text textAnchor="middle" y="9" fontSize="25" fontWeight="700" fill="#fff4e2">067°</text>
          <path d="M-7 -112 H7 L0 -98Z" fill="#ffa94d" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 400 250" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
      <defs>
        <linearGradient id="pa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#161c4a" /><stop offset=".55" stopColor="#b56d8e" /><stop offset="1" stopColor="#f3b08c" /></linearGradient>
        <radialGradient id="ps"><stop offset="0" stopColor="#ffe3b8" stopOpacity=".9" /><stop offset="1" stopColor="#ffe3b8" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="400" height="250" fill="url(#pa)" />
      <circle cx="96" cy="150" r="90" fill="url(#ps)" /><circle cx="96" cy="150" r="14" fill="#fff0d6" />
      <path d="M0 170 L70 120 L120 150 L200 70 L260 130 L320 96 L400 150 V250 H0Z" fill="#7a6a8e" />
      <path d="M200 70 L176 100 L192 96 L204 108 L214 92 L232 106Z M320 96 L304 116 L316 112 L326 122 L336 108Z" fill="#fff6f0" />
      <path d="M0 200 L60 160 L130 196 L210 150 L300 200 L360 170 L400 190 V250 H0Z" fill="#3b3a5c" />
      <path d="M0 230 L90 200 L190 228 L290 204 L400 226 V250 H0Z" fill="#1c1b36" />
      {[[122, 214], [170, 222], [214, 212]].map(([x, y]) => <g key={x}><path d={`M${x} ${y} l7 -12 l7 12Z`} fill="#ff8a3d" /><circle cx={x + 7} cy={y - 4} r="9" fill="#ff8a3d" opacity=".35" /></g>)}
    </svg>
  );
}

function Card({ b, i }: { b: Bundle; i: number }) {
  return (
    <Reveal>
      <article className="panel spot group grid overflow-hidden !rounded-[30px] lg:grid-cols-[1.15fr_1fr]" style={{ "--c": b.theme.accent } as CSSProperties}>
        <Link href={`/bundles/${b.slug}`} className={`relative block min-h-[300px] overflow-hidden ${i % 2 ? "lg:order-2" : ""}`} aria-label={`Enter ${b.name}`}>
          <div className="absolute inset-0 transition duration-[1200ms] ease-out group-hover:scale-[1.06]"><Poster slug={b.slug} /></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          <div className="absolute left-6 top-5 font-mono text-[10.5px] tracking-[0.22em] text-white/70 uppercase">Bundle N°{String(i + 1).padStart(2, "0")}</div>
          <div className="absolute inset-x-6 bottom-5 flex items-end justify-between gap-4">
            <div className="text-[clamp(2.4rem,6vw,4.4rem)] font-semibold leading-none tracking-[-0.03em] text-white" style={{ fontFamily: b.theme.display }}>{b.wordmark}</div>
            <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold text-black opacity-0 transition duration-500 group-hover:opacity-100">Enter the experience →</span>
          </div>
        </Link>
        <div className="flex flex-col p-7 sm:p-9">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">{b.category}</span><span className="chip">WebGL · {b.gpu} GPU</span>
          </div>
          <h2 className="mt-5 font-display text-[clamp(1.6rem,3vw,2.3rem)] font-semibold leading-[1.05] tracking-[-0.04em]">{b.tagline}</h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-dim">{b.blurb}</p>
          <div className="mt-6 grid gap-1.5 text-[13px] text-fg/75 sm:grid-cols-2">
            {b.techniques.slice(0, 4).map((t) => <div key={t} className="flex gap-2"><span style={{ color: b.theme.accent }}>◆</span>{t}</div>)}
          </div>
          <div className="mt-6">
            <div className="font-mono text-[10.5px] tracking-[0.18em] text-dim uppercase">Same theme, four more pages</div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {PAGE_KEYS.map((k) => <Link key={k} href={`/bundles/${b.slug}/${k}`} className="chip transition hover:border-aurora/60 hover:text-fg">{b.nav[k]}</Link>)}
            </div>
          </div>
          <div className="mt-auto flex flex-wrap gap-3 pt-8">
            <Link href={`/bundles/${b.slug}`} className="btn btn-primary">Enter the experience →</Link>
            <button type="button" className="btn btn-ghost" onClick={() => void downloadBundle(b.slug)}>Download source (.zip)</button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export default function BundlesIndex() {
  return (
    <main className="mx-auto max-w-[1320px] px-5 pb-28 pt-40 sm:px-8">
      <div className="max-w-4xl">
        <div className="eyebrow">Bundles</div>
        <h1 className="h-display mt-5 text-[clamp(2.8rem,7.4vw,6.4rem)]">One theme. Every page.<br /><span className="aurora-text">Fully cinematic.</span></h1>
        <p className="mt-6 max-w-2xl text-[16.5px] leading-relaxed text-fg/70">
          A bundle is a complete site in a single visual language: a scroll-driven WebGL landing page where the camera flies like a game cut-scene — and the pricing, sign-in, reservation and account pages that match it, down to the colour of the focus ring. Open one and scroll.
        </p>
      </div>
      <ol className="mt-12 grid gap-4 md:grid-cols-3">
        {([["01", "Scroll flies the camera", "A spline rail, a damped playhead, FOV kick and horizon banking. Scroll is the director."], ["02", "Pages that keep the theme", "Pricing, sign-in, reserve and account share palette, type and the same world behind them."], ["03", "Real, working flows", "Validation, a booking that lands in your account, a cancel button. State lives in your browser."]] as const).map(([n, t, d]) => (
          <li key={n} className="panel flex gap-4 p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong font-mono text-xs text-aurora">{n}</span>
            <div><div className="font-display text-lg font-semibold tracking-[-0.02em]">{t}</div><p className="mt-1 text-[13.5px] leading-relaxed text-dim">{d}</p></div>
          </li>
        ))}
      </ol>
      <div className="mt-14 grid gap-8">{BUNDLES.map((b, i) => <Card key={b.slug} b={b} i={i} />)}</div>
      <p className="mt-10 text-center font-mono text-[11px] tracking-[0.16em] text-dim uppercase">Needs WebGL · best on a desktop GPU · honours reduced-motion</p>
    </main>
  );
}
