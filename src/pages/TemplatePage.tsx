import { Link } from "@/lib/router";
import { TEMPLATES, bySlug, indexOf } from "@/lib/templates";
import { PROMPTS, fill } from "@/lib/prompts";
import { ZIP_FILE_TREE, downloadTemplate, metricsFor, readSource } from "@/lib/files";
import { getStats } from "@/lib/stats";
import { PreviewFrame } from "@/components/preview-frame";
import { CodeViewer } from "@/components/code-viewer";
import { CopyButton } from "@/components/copy-button";
import { SITE } from "@/lib/site";
import { openDemo } from "@/lib/demo";

const GPU_COPY = { Light: "Runs smoothly on budget phones and laptops.", Medium: "Great on modern phones and any laptop with a GPU.", Heavy: "Best on desktop / recent phones — heaviest effects in the pack." } as const;

export default function TemplatePage({ slug }: { slug: string }) {
  const t = bySlug(slug);
  if (!t) {
    return (
      <main className="mx-auto max-w-[1320px] px-5 pb-28 pt-40 sm:px-8">
        <h1 className="h-display text-[clamp(3rem,8vw,6rem)]">Not found</h1>
        <Link href="/landing-pages" className="btn btn-primary mt-8">Browse landing pages</Link>
      </main>
    );
  }
  const i = indexOf(slug);
  const prev = TEMPLATES[(i + TEMPLATES.length - 1) % TEMPLATES.length];
  const next = TEMPLATES[(i + 1) % TEMPLATES.length];
  const stats = getStats()[slug];
  const m = metricsFor(slug);
  const files = (["main.js", "index.html", "style.css"] as const).map((n) => ({ name: n, code: readSource(slug, n) }));
  const specific = t.tweaks;
  const general = PROMPTS.slice(0, 6);

  return (
    <main className="mx-auto max-w-[1320px] px-5 pb-28 pt-28 sm:px-8">
      <Link href="/landing-pages" className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] text-dim uppercase hover:text-fg">← All landing pages</Link>

      <header className="mt-8 flex flex-wrap items-end justify-between gap-8">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">N°{String(i + 1).padStart(2, "0")}</span>
            {t.tags.map((x) => <span key={x} className="chip">{x}</span>)}
            <span className="chip">{t.theme} theme</span>
          </div>
          <h1 className="h-display mt-6 text-[clamp(3rem,8vw,7.4rem)]">{t.name}</h1>
          <p className="mt-4 font-display text-2xl tracking-[-0.02em]" style={{ color: t.accent }}>{t.tagline}</p>
          <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-dim">{t.blurb}</p>
        </div>
        <div className="flex flex-col gap-3 sm:min-w-[260px]">
          <button type="button" onClick={() => void downloadTemplate(t)} className="btn btn-primary !h-14 !text-[15px]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M12 3v13m0 0 5-5m-5 5-5-5M4 21h16" /></svg>
            Download .zip
          </button>
          <button type="button" onClick={() => openDemo(t.slug)} className="btn btn-ghost">Open fullscreen ↗</button>
          <p className="text-center font-mono text-[11px] text-dim">{m.kb} KB source · {(stats?.downloads ?? 0).toLocaleString()} downloads</p>
        </div>
      </header>

      <div className="mt-12"><PreviewFrame slug={t.slug} /></div>

      {/* facts */}
      <section className="mt-20 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="panel p-8">
          <div className="eyebrow">What&apos;s inside</div>
          <div className="mt-8 grid gap-10 sm:grid-cols-2">
            <div>
              <h3 className="font-mono text-[11px] tracking-[0.18em] text-dim uppercase">Techniques</h3>
              <ul className="mt-4 space-y-2.5 text-[15px]">
                {t.techniques.map((x) => <li key={x} className="flex gap-3"><i className="mt-2 size-1.5 shrink-0 rotate-45" style={{ background: t.accent }} />{x}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-mono text-[11px] tracking-[0.18em] text-dim uppercase">Interactions</h3>
              <ul className="mt-4 space-y-2.5 text-[15px]">
                {t.interactions.map((x) => <li key={x} className="flex gap-3"><i className="mt-2 size-1.5 shrink-0 rotate-45 bg-white/40" />{x}</li>)}
              </ul>
              <h3 className="mt-8 font-mono text-[11px] tracking-[0.18em] text-dim uppercase">Best for</h3>
              <div className="mt-4 flex flex-wrap gap-2">{t.bestFor.map((x) => <span key={x} className="chip !normal-case !tracking-normal !text-fg/80">{x}</span>)}</div>
            </div>
          </div>
        </div>
        <div className="panel p-8">
          <div className="eyebrow">Specs</div>
          <dl className="mt-8 space-y-5">
            {[
              ["GPU load", `${t.gpu} — ${GPU_COPY[t.gpu]}`],
              ["Code", `${m.lines.toLocaleString()} lines · ≈ ${(m.tokens / 1000).toFixed(1)}k tokens you don't have to generate`],
              ["Sections", t.sections > 1 ? `${t.sections} scroll scenes` : "Single-screen interactive"],
              ["Stack", "Three.js · vanilla JS · no build step"],
            ].map(([k, v]) => (
              <div key={k} className="border-b border-line pb-5 last:border-0 last:pb-0">
                <dt className="font-mono text-[11px] tracking-[0.18em] text-dim uppercase">{k}</dt>
                <dd className="mt-1.5 text-[15px] leading-snug">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* prompts */}
      <section className="mt-24">
        <div className="eyebrow">Customise with prompts</div>
        <h2 className="h-display mt-5 text-[clamp(2.2rem,4.6vw,4rem)]">Paste. Fill the brackets. Done.</h2>
        <p className="mt-4 max-w-xl text-[15px] text-dim">Tip: tell your AI tool to read <code className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-xs">AI_CONTEXT.md</code> first — it saves it from exploring the codebase.</p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {specific.map((p) => (
            <div key={p.label} className="panel flex flex-col p-6" style={{ borderColor: `${t.accent}33` }}>
              <span className="chip self-start" style={{ color: t.accent }}>{t.name}-specific</span>
              <h3 className="mt-4 font-display text-lg font-semibold tracking-[-0.02em]">{p.label}</h3>
              <p className="mt-3 line-clamp-5 flex-1 font-mono text-xs leading-relaxed text-white/45">{p.prompt}</p>
              <div className="mt-5"><CopyButton text={p.prompt} slug={t.slug} label="Copy prompt" /></div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {general.map((p) => {
            const body = fill(p.body, t.name);
            return (
              <div key={p.id} className="panel flex flex-col p-6">
                <span className="chip self-start">{p.category}</span>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-[-0.02em]">{p.title}</h3>
                <p className="mt-2 text-sm text-dim">{p.summary}</p>
                <div className="mt-5"><CopyButton text={body} slug={t.slug} label="Copy prompt" /></div>
              </div>
            );
          })}
        </div>
        <Link href="/prompts" className="mt-6 inline-block text-sm text-aurora hover:underline">See the full prompt library →</Link>
      </section>

      {/* code */}
      <section className="mt-24">
        <div className="eyebrow">Read the source</div>
        <h2 className="h-display mt-5 text-[clamp(2.2rem,4.6vw,4rem)]">No black boxes.</h2>
        <p className="mt-4 max-w-xl text-[15px] text-dim">This is exactly what lands in your zip (plus the shared engine). Copy a file, or grab the whole thing.</p>
        <div className="mt-10"><CodeViewer files={files} /></div>
      </section>

      {/* quickstart */}
      <section className="mt-24 grid gap-5 lg:grid-cols-2">
        <div className="panel p-8">
          <div className="eyebrow">Quick start</div>
          <ol className="mt-8 space-y-6">
            {[
              ["Unzip", `${t.slug}-3d-template.zip`],
              ["Open a terminal inside the folder", "cd " + t.slug + "-3d-template"],
              ["Start a static server", "npx serve ."],
              ["Edit CONFIG in main.js, colours in style.css, copy in index.html", ""],
            ].map(([a, b], k) => (
              <li key={a} className="flex gap-5">
                <span className="font-mono text-xs text-aurora">0{k + 1}</span>
                <div>
                  <p className="text-[15px]">{a}</p>
                  {b && <code className="mt-2 inline-block rounded-lg border border-line bg-black/40 px-3 py-1.5 font-mono text-xs text-white/70">{b}</code>}
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="panel p-8">
          <div className="eyebrow">In the zip</div>
          <ul className="mt-8 space-y-1.5 font-mono text-[13px] text-white/70">
            <li className="text-fg">{t.slug}-3d-template/</li>
            {ZIP_FILE_TREE.map((f) => <li key={f} className="pl-5 text-dim before:mr-3 before:text-white/20 before:content-['├─']">{f}</li>)}
          </ul>
          <button type="button" onClick={() => void downloadTemplate(t)} className="btn btn-primary mt-8">Download {t.name}</button>
        </div>
      </section>

      {/* pager */}
      <nav className="mt-24 grid gap-4 sm:grid-cols-2">
        {[
          { t: prev, dir: "← Previous" },
          { t: next, dir: "Next →" },
        ].map(({ t: x, dir }) => (
          <Link key={x.slug} href={`/templates/${x.slug}`} className="panel group p-7 transition hover:border-line-strong">
            <div className="font-mono text-[11px] tracking-[0.18em] text-dim uppercase">{dir}</div>
            <div className="mt-3 flex items-center justify-between">
              <span className="h-display text-4xl">{x.name}</span>
              <i className="size-3 rotate-45 transition group-hover:scale-150" style={{ background: x.accent }} />
            </div>
            <p className="mt-1 text-sm text-dim">{x.tagline}</p>
          </Link>
        ))}
      </nav>
      <p className="mt-12 text-center font-mono text-[11px] tracking-[0.14em] text-dim uppercase">{SITE.name} — download, edit, ship</p>
    </main>
  );
}
