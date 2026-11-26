"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "@/lib/router";
import { PILLARS } from "@/lib/skill";
import { SKILL, TIERS } from "@/lib/site";

const st = (o: Record<string, string | number>) => o as CSSProperties;
const LETTER_COLORS = ["#5cffc4", "#3de7ff", "#a58bff", "#ff7ad9"];
const SPARKS: [string, string, string, string, string][] = [
  ["12%", "14%", "#5cffc4", "0s", "3.2s"], ["86%", "10%", "#a58bff", "1.1s", "4s"], ["92%", "46%", "#ff7ad9", "0.6s", "3.6s"],
  ["8%", "62%", "#3de7ff", "1.8s", "4.4s"], ["78%", "88%", "#ffd28a", "0.3s", "3.8s"], ["30%", "94%", "#5cffc4", "2.2s", "3.4s"],
];

/* ───────────── the featured AURA pricing card ───────────── */
export function AuraTierCard({ items }: { items: string[] }) {
  const ref = useRef<HTMLElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <article id="skill-pricing" ref={ref} onPointerMove={move} className="aura-ring group h-full lg:-my-3">
      <div className="aura-ring-glow" aria-hidden />
      <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] bg-[linear-gradient(165deg,rgb(11_26_36),rgb(4_7_14)_62%)] p-7 sm:p-8">
        {/* atmosphere */}
        <div className="pointer-events-none absolute -top-24 -right-20 size-[300px] rounded-full opacity-60 blur-3xl" style={{ background: "radial-gradient(circle, rgb(165 139 255 / .55), transparent 65%)", animation: "orb-a 9s ease-in-out infinite alternate" }} />
        <div className="pointer-events-none absolute -bottom-28 -left-24 size-[300px] rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle, rgb(92 255 196 / .5), transparent 65%)", animation: "orb-a 11s ease-in-out infinite alternate-reverse" }} />
        <div className="grid-dots pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: "radial-gradient(340px circle at var(--mx, 50%) var(--my, 0%), rgb(92 255 196 / .13), transparent 62%)" }} />
        <div className="aura-sheen" aria-hidden />
        {SPARKS.map(([l, t, c, d, s], i) => (<i key={i} className="spark" style={st({ left: l, top: t, "--sc": c, "--sl": d, "--sd": s })} aria-hidden />))}

        <div className="relative flex items-center justify-between">
          <span className="rounded-full bg-aurora px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.16em] text-[#021510] uppercase">Most popular</span>
          <span className="chip !border-white/15 !text-fg/70">v{SKILL.version}</span>
        </div>

        <div className="relative mt-7">
          <div className="font-mono text-[11px] tracking-[0.2em] text-aurora uppercase">The skill</div>
          <div className="relative mt-1">
            <div className="aura-wordmark pointer-events-none absolute inset-0 select-none font-display text-[88px] leading-none font-bold tracking-[-0.06em] opacity-60 blur-[18px]" aria-hidden>AURA</div>
            <h3 className="aura-wordmark relative font-display text-[88px] leading-[0.95] font-bold tracking-[-0.06em]">AURA</h3>
          </div>
          <div className="mt-3 flex gap-1.5" aria-label="Atmosphere, Unbroken, Rhythm, Authorship">
            {PILLARS.map((p, i) => (<span key={i} className="rounded-full border px-2.5 py-1 font-mono text-[9.5px] tracking-[0.1em] uppercase" style={{ color: LETTER_COLORS[i], borderColor: `${LETTER_COLORS[i]}55`, background: `${LETTER_COLORS[i]}12` }}>{p.t}</span>))}
          </div>
        </div>

        <div className="relative mt-6 flex items-end gap-2">
          <span className="font-display text-6xl font-semibold tracking-[-0.06em]">{TIERS.skill.label}</span>
          <span className="pb-2 font-mono text-[10.5px] tracking-[0.16em] text-dim uppercase">one-time</span>
        </div>
        <p className="relative mt-3 text-[14px] leading-relaxed text-fg/70">Teach Claude, Codex or Cursor to direct, build and QA a $10,000-grade 3D website.</p>

        <ul className="relative mt-6 flex-1 space-y-2.5">
          {items.map((t, i) => (
            <li key={t} className="flex gap-3 text-[13.5px] text-fg/90"><span className="mt-0.5" style={{ color: LETTER_COLORS[i % 4] }} aria-hidden>✦</span>{t}</li>
          ))}
        </ul>

        <div className="relative mt-8">
          <Link href="/skill/checkout" className="btn btn-primary btn-shimmer h-[56px] w-full text-[15px]">Get AURA — {TIERS.skill.label} <span aria-hidden>→</span></Link>
        </div>
      </div>
    </article>
  );
}

/* ───────────── the AURA acronym stage ───────────── */
export function AuraStage({ children }: { children?: ReactNode }) {
  // Nothing stays open once the pointer or focus leaves the list: every row returns to its shrunk state.
  const [on, setOn] = useState(-1);
  const rest = () => setOn(-1);

  return (
    <div className="stage p-6 sm:p-10 lg:p-14">
      <div className="stage-rays" aria-hidden />
      <div className="orbit hidden sm:block" style={st({ width: 640, height: 640, right: -220, top: -240, animation: "spin 60s linear infinite", "--oc": "#a58bff" })} aria-hidden><i /></div>
      <div className="orbit hidden sm:block" style={st({ width: 420, height: 420, right: -110, top: -130, animation: "spin-rev 40s linear infinite", "--oc": "#5cffc4" })} aria-hidden><i /></div>
      {SPARKS.slice(0, 4).map(([l, t, c, d, s], i) => (<i key={i} className="spark" style={st({ left: l, top: t, "--sc": c, "--sl": d, "--sd": s })} aria-hidden />))}

      <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
        <div>{children}</div>

        <div className="flex flex-col gap-4">
          <p className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.2em] text-aurora uppercase"><span className="size-1.5 animate-pulse rounded-full bg-aurora shadow-[0_0_10px_#5cffc4]" aria-hidden />Hover each letter to open it</p>
        <div role="tablist" aria-label="What AURA stands for" className="flex flex-col gap-2.5"
          onMouseLeave={rest}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) rest(); }}>
          {PILLARS.map((p, i) => {
            const c = LETTER_COLORS[i];
            const isOn = on === i;
            return (
              <button key={i} type="button" role="tab" aria-selected={isOn} aria-expanded={isOn} data-on={isOn}
                className="letter-tile flex items-center gap-4 rounded-2xl px-4 py-3.5 sm:gap-6 sm:px-6 sm:py-4"
                style={st({ "--lc": c, "--i": i })}
                onMouseEnter={() => setOn(i)} onFocus={() => setOn(i)} onClick={() => setOn(i)}>
                <span className="letter-glyph w-[44px] shrink-0 text-center text-[52px] sm:w-[58px] sm:text-[60px]">{p.k}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-4">
                    <span className="font-display text-[18px] font-semibold tracking-[-0.03em] text-fg sm:text-[21px]">{p.t}</span>
                    <span className="shrink-0 font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: c }}>{p.pts} pts</span>
                  </span>
                  <span className="grid transition-[grid-template-rows,opacity] duration-500 ease-out" style={st({ gridTemplateRows: isOn ? "1fr" : "0fr", opacity: isOn ? 1 : 0 })}>
                    <span className="min-h-0 overflow-hidden">
                      <span className="block pt-2 text-left text-[13.5px] leading-relaxed text-fg/70">{p.d}</span>
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}
