import { TEMPLATES } from "@/lib/templates";
import { metricsFor } from "@/lib/files";
import { getStats } from "@/lib/stats";
import { Gallery } from "@/components/gallery";
import { Reveal } from "@/components/reveal";

const KIT = [
  ["Hero that converts", "Headline, sub-line and a primary + secondary action above the fold, every time."],
  ["CTA that follows", "The nav button fills with the accent once you scroll past the hero. On phones a sticky bar takes over."],
  ["Footer that works", "Link columns, newsletter capture with validation, legal row and a back-to-top — injected by the shared engine."],
  ["Honest performance", "Every card carries a GPU rating, caps pixel ratio and falls back gracefully without WebGL."],
  ["Scroll with purpose", "One camera move per section, a progress rail and section dots so nobody gets lost."],
  ["Yours in minutes", "Edit a CONFIG object, a handful of CSS variables and the copy. That's the whole job."],
];

export default function LandingPagesPage() {
  const stats = getStats();
  const items = TEMPLATES.map((t) => ({ ...t, tokens: metricsFor(t.slug).tokens, downloads: stats[t.slug]?.downloads ?? 0 }));
  return (
    <main className="relative">
      <div className="aurora pointer-events-none absolute inset-x-0 top-0 h-[640px]" aria-hidden />
      <div className="relative mx-auto max-w-[1320px] px-5 pb-28 pt-36 sm:px-8">
        <div className="grid items-end gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="rise eyebrow">Landing pages · {TEMPLATES.length} templates</div>
            <h1 className="h-display rise mt-6 text-[clamp(2.8rem,7vw,6.6rem)]" style={{ "--d": "120ms" } as React.CSSProperties}>
              Landing pages that <span className="text-aurora">stop the scroll.</span>
            </h1>
          </div>
          <div className="rise" style={{ "--d": "260ms" } as React.CSSProperties}>
            <p className="text-[16px] leading-relaxed text-dim">
              Cinematic, scroll-driven 3D websites — and every one of them is built to do a landing page&apos;s job: say what it is, earn trust, and get the click.
              Hover a card to scrub through the page, open one to see it full-size.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <Gallery items={items} />
        </div>

        <section className="mt-28">
          <Reveal>
            <div className="eyebrow">Every one is a real landing page</div>
            <h2 className="h-display mt-5 max-w-3xl text-[clamp(2.2rem,4.8vw,4.4rem)]">Built to convert, not just to wow.</h2>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {KIT.map(([t, d], i) => (
              <Reveal key={t} delay={(i % 3) * 80}>
                <div className="panel spot h-full p-7">
                  <div className="font-mono text-xs tracking-[0.2em] text-aurora">0{i + 1}</div>
                  <h3 className="mt-8 font-display text-xl font-semibold tracking-[-0.02em]">{t}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-dim">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
