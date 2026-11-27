"use client";

import { useState, type ReactNode } from "react";
import { Reveal } from "@/components/reveal";
import { Pipeline } from "@/components/pipeline";
import { SkillPrompt } from "@/components/skill-prompt";
import { FAQ } from "@/lib/skill";

const STEPS: [string, string][] = [
  ["Unzip the skill", "You get one folder: aura-3d-web."],
  ["Open that folder in your agent", "Claude Code, Cursor, Codex, Gemini CLI, or any agent that can read files."],
  ["Paste the prompt", "Your agent adds the skill to its skills directory. That's all it does for now."],
];

const ITEMS: [string, ReactNode][] = FAQ;

/** Accordion where one answer opens at a time; the bar and the plus-to-minus morph animate. */
function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mt-12 border-t border-line">
      {ITEMS.map(([q, a], i) => {
        const on = open === i;
        return (
          <Reveal key={q} delay={(i % 4) * 60}>
            <div className="relative border-b border-line transition-colors duration-500 hover:bg-white/[0.02]" onMouseEnter={() => setOpen(i)}>
              <span className="absolute top-0 left-0 h-full w-[2px] origin-top bg-aurora shadow-[0_0_12px_#5cffc4] transition-transform duration-700 ease-out" style={{ transform: on ? "scaleY(1)" : "scaleY(0)" }} aria-hidden />
              <button type="button" aria-expanded={on} onClick={() => setOpen(on ? null : i)} className="group flex w-full items-center gap-5 py-6 pr-2 pl-5 text-left">
                <span className="font-mono text-[12px] tracking-[0.18em] text-dim tabular-nums transition-colors duration-500 group-hover:text-aurora">{String(i + 1).padStart(2, "0")}</span>
                <span className="flex-1 font-display text-[clamp(1.15rem,2.3vw,1.6rem)] font-semibold tracking-[-0.03em] transition-colors duration-300 group-hover:text-aurora">{q}</span>
                <span className="relative grid size-10 shrink-0 place-items-center rounded-full border border-line transition-colors duration-500 group-hover:border-aurora" aria-hidden>
                  <span className="absolute h-px w-4 bg-aurora" />
                  <span className="absolute h-px w-4 bg-aurora transition-transform duration-500" style={{ transform: on ? "rotate(0deg) scaleX(0)" : "rotate(90deg)" }} />
                </span>
              </button>
              <div className="grid transition-[grid-template-rows] duration-500 ease-out" style={{ gridTemplateRows: on ? "1fr" : "0fr" }}>
                <div className="overflow-hidden">
                  <p className="max-w-[720px] pr-2 pb-7 pl-[calc(2.5rem+2.4ch)] text-[15px] leading-relaxed text-dim transition-all duration-500" style={{ opacity: on ? 1 : 0, transform: on ? "none" : "translateY(-6px)" }}>{a}</p>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

/** The skill's detail sections on the Services page: the pipeline, install, FAQ. */
export default function SkillLanding() {
  return (
    <div className="relative">
      {/* PIPELINE */}
      <Pipeline />

      {/* INSTALL */}
      <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8">
        <Reveal><div className="eyebrow">After you download</div><h2 className="h-display mt-4 text-[clamp(1.8rem,3.6vw,3rem)]">Install it. <span className="aurora-text">Paste one prompt.</span></h2></Reveal>
        <Reveal delay={100}>
          <ol className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="rounded-[24px] border border-line bg-white/[0.02] p-6">
                <span className="font-mono text-[11px] tracking-[0.2em] text-aurora">0{i + 1}</span>
                <h3 className="mt-4 font-display text-[20px] font-semibold tracking-[-0.02em]">{t}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-dim">{d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6"><SkillPrompt /></div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[1100px] px-5 py-24 sm:px-8">
        <Reveal><div className="eyebrow">FAQ</div><h2 className="h-display mt-4 text-[clamp(1.8rem,3.6vw,3rem)]">Questions<span className="text-aurora">.</span></h2></Reveal>
        <Faq />
      </section>
    </div>
  );
}
