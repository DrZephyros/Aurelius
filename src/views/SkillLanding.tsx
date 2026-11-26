"use client";

import { useState } from "react";
import { Link } from "@/lib/router";
import { Reveal } from "@/components/reveal";
import { Pipeline } from "@/components/pipeline";
import { FAQ, INSTALLS } from "@/lib/skill";

const COMPARE: [string, string, string][] = [
  ["The idea", "A spinning cube, a gradient, fade-up cards", "One authored world and one camera. Scroll is the playhead"],
  ["Look", "Default lights, no environment map, flat materials", "Key / rim / fill / practical, a designed environment map, matter with a story"],
  ["Depth", "One plane", "Five depth planes in every frame — occluder, subject, mid, back, atmosphere"],
  ["Type", "Inter 64px, centred", "Giant fitted type the world occludes, reflects and lights"],
  ["Quality bar", "“Looks good”", "12 frames × 3 viewports, 100-point score, three polish loops"],
  ["Delivery", "A hero section", "Hero film + end-state + routes + metadata + mobile edit + hand-off"],
];

/** The skill's detail sections on the Services page: the difference, the pipeline, install, FAQ. */
export default function SkillLanding() {
  const [inst, setInst] = useState(INSTALLS[0].id);
  const ins = INSTALLS.find((x) => x.id === inst)!;

  return (
    <div className="relative">
      {/* COMPARE */}
      <section className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8">
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

      {/* PIPELINE */}
      <Pipeline />

      {/* INSTALL */}
      <section className="mx-auto max-w-[1320px] px-5 py-24 sm:px-8">
        <Reveal><div className="eyebrow">After you download</div><h2 className="h-display mt-4 text-[clamp(1.8rem,3.6vw,3rem)]">Installs in one minute.</h2></Reveal>
        <div className="mt-6 flex flex-wrap gap-2">{INSTALLS.map((x) => (<button key={x.id} type="button" onClick={() => setInst(x.id)} aria-pressed={x.id === inst} className={`rounded-full border px-4 py-2 text-[13px] transition ${x.id === inst ? "border-transparent bg-white text-black" : "border-line text-dim hover:text-fg"}`}>{x.t}</button>))}</div>
        <div className="mt-5 space-y-3">{ins.steps.map((s) => (<div key={s.label} className="panel !rounded-2xl p-4"><div className="text-[12.5px] text-dim">{s.label}</div><pre className="mt-2 overflow-x-auto font-mono text-[12px] whitespace-pre-wrap text-fg/85">{s.code}</pre></div>))}</div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-[900px] scroll-mt-24 px-5 pb-20 sm:px-8">
        <Reveal><div className="eyebrow">FAQ</div><h2 className="h-display mt-4 text-[clamp(1.8rem,3.6vw,3rem)]">Questions.</h2></Reveal>
        <div className="mt-6">
          {FAQ.map(([q, a]) => (<details key={q} className="group border-t border-line py-4"><summary className="flex cursor-pointer list-none items-center justify-between font-display text-[18px] font-semibold tracking-[-0.02em]">{q}<span className="text-aurora transition group-open:rotate-45">+</span></summary><p className="mt-3 text-[14.5px] leading-relaxed text-dim">{a}</p></details>))}
          <details className="group border-y border-line py-4"><summary className="flex cursor-pointer list-none items-center justify-between font-display text-[18px] font-semibold tracking-[-0.02em]">Can I just hire you to build it?<span className="text-aurora transition group-open:rotate-45">+</span></summary><p className="mt-3 text-[14.5px] leading-relaxed text-dim">Yes — <Link href="/services#build" className="text-aurora underline-offset-4 hover:underline">send a request</Link> with your brief, budget and timeline. Custom builds use this exact skill plus hand-finishing.</p></details>
        </div>
      </section>
    </div>
  );
}
