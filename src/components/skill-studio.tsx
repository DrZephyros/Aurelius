"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@/lib/router";
import { CopyButton } from "@/components/copy-button";
import { ARCHETYPES } from "@/lib/skill";
import { LENGTHS, PALETTES, composePrompt, patchStudio, useStudio, type StudioState } from "@/lib/studio";

const field =
  "w-full rounded-xl border border-line bg-white/[0.04] px-4 py-3 text-[14px] text-fg outline-none transition placeholder:text-dim/60 focus:border-[rgb(92_255_196/0.6)] focus:bg-white/[0.07]";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-dim uppercase">{label}</span>
      {children}
    </label>
  );
}

/** The Skill Studio — compose a tailored, ready-to-paste agent prompt for ANY brief, and grab the skill, without leaving the page. */
export function SkillStudio({ layout = "split" }: { layout?: "split" | "stack" }) {
  const s = useStudio();
  const set = (p: Partial<StudioState>) => patchStudio(p);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const prompt = useMemo(() => composePrompt(s, origin), [s, origin]);
  const arch = ARCHETYPES.find((a) => a.id === s.archetype) ?? ARCHETYPES[0];
  const pal = PALETTES.find((p) => p.id === s.palette) ?? PALETTES[0];
  const fetchLine = `Read ${origin || "https://YOUR-SITE"}/skill.md and follow it. Then: ${s.subject.trim() || "build a scroll-driven 3D website for [SUBJECT]"}.`;
  const install = `mkdir -p ~/.claude/skills && curl -L ${origin || "https://YOUR-SITE"}/skill.zip -o aura.zip && unzip -o aura.zip -d ~/.claude/skills/`;
  const ready = s.subject.trim().length > 3;

  return (
    <div className={`grid gap-6 ${layout === "split" ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]" : ""}`}>
      {/* ── the brief ── */}
      <div className="space-y-5">
        <div>
          <span className="mb-2 block font-mono text-[10px] tracking-[0.2em] text-dim uppercase">World archetype</span>
          <div className="flex flex-wrap gap-2">
            {ARCHETYPES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => set({ archetype: a.id })}
                aria-pressed={s.archetype === a.id}
                className={`rounded-full border px-3.5 py-1.5 text-[12.5px] transition ${s.archetype === a.id ? "border-[rgb(92_255_196/0.7)] bg-[rgb(92_255_196/0.12)] text-fg" : "border-line text-dim hover:border-line-strong hover:text-fg"}`}
              >
                {a.t}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-dim">
            <span className="text-fg/80">Seed world:</span> {arch.world}
          </p>
        </div>

        <Field label="What is it? (the subject)">
          <textarea
            className={`${field} min-h-[84px] resize-y`}
            placeholder="e.g. Ardmere — a 12-suite lakeside hotel in the Scottish Highlands"
            value={s.subject}
            onChange={(e) => set({ subject: e.target.value })}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Audience">
            <input className={field} placeholder="who must it win over?" value={s.audience} onChange={(e) => set({ audience: e.target.value })} />
          </Field>
          <Field label="The one feeling">
            <input className={field} placeholder="awe · hunger · calm · dread…" value={s.emotion} onChange={(e) => set({ emotion: e.target.value })} />
          </Field>
        </div>
        <Field label="Final action (the CTA in the last frame)">
          <input className={field} placeholder="Reserve a suite · Join the waitlist · Hire me" value={s.cta} onChange={(e) => set({ cta: e.target.value })} />
        </Field>

        <div>
          <span className="mb-2 block font-mono text-[10px] tracking-[0.2em] text-dim uppercase">Palette</span>
          <div className="flex flex-wrap gap-2">
            {PALETTES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => set({ palette: p.id })}
                aria-pressed={s.palette === p.id}
                className={`flex items-center gap-2 rounded-full border py-1.5 pr-3.5 pl-2 text-[12.5px] transition ${s.palette === p.id ? "border-[rgb(92_255_196/0.7)] bg-white/[0.08] text-fg" : "border-line text-dim hover:border-line-strong hover:text-fg"}`}
              >
                <span className="flex -space-x-1">
                  {p.hex.map((h) => (
                    <i key={h} className="size-3.5 rounded-full border border-black/40" style={{ background: h }} />
                  ))}
                </span>
                {p.t}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-dim">{pal.note}</p>
        </div>

        <div>
          <span className="mb-2 block font-mono text-[10px] tracking-[0.2em] text-dim uppercase">Length of the film</span>
          <div className="inline-flex rounded-full border border-line p-1">
            {(Object.keys(LENGTHS) as (keyof typeof LENGTHS)[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => set({ length: k })}
                className={`rounded-full px-4 py-1.5 text-[12.5px] transition ${s.length === k ? "bg-white/12 text-fg" : "text-dim hover:text-fg"}`}
              >
                {LENGTHS[k].t} <span className="hidden font-mono text-[10px] text-dim sm:inline">· {LENGTHS[k].vh}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── the prompt ── */}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="panel overflow-hidden !rounded-2xl !bg-[#090b0f]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2.5">
            <div className="inline-flex rounded-full border border-line p-0.5 text-[11.5px]">
              {([["installed", "Skill installed"], ["link", "Agent fetches by link"]] as const).map(([id, l]) => (
                <button key={id} type="button" onClick={() => set({ mode: id })} className={`rounded-full px-3 py-1 transition ${s.mode === id ? "bg-white/12 text-fg" : "text-dim hover:text-fg"}`}>
                  {l}
                </button>
              ))}
            </div>
            <span className="font-mono text-[10.5px] text-dim">{prompt.length.toLocaleString()} chars · live</span>
          </div>
          <pre className="max-h-[340px] overflow-auto px-4 py-4 font-mono text-[12px] leading-relaxed whitespace-pre-wrap text-[#cdd3df]">{prompt}</pre>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <CopyButton text={prompt} label={ready ? "Copy the prompt" : "Copy prompt (add a subject first)"} className="btn btn-primary !h-12 !px-6 !text-[14px]" />
          <CopyButton text={fetchLine} label="Copy 1-line version" className="btn btn-ghost !h-12 !px-5 !text-[13px]" />
        </div>

        <div className="rounded-2xl border border-line bg-white/[0.03] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">Get the skill</span>
            <span className="font-mono text-[10.5px] text-dim">works with Claude Code · Cursor · Codex · Gemini · Copilot</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/skill#get" className="btn btn-primary !h-10 !px-4 !text-[12.5px]">Get the full skill · $10</Link>
            <a className="btn btn-ghost !h-10 !px-4 !text-[12.5px]" href="/skill.md" target="_blank" rel="noreferrer">/skill.md ↗</a>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-[#090b0f] py-2 pr-2 pl-3">
            <code className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-[#cdd3df]">{install}</code>
            <CopyButton text={install} label="Copy install" className="btn btn-ghost !h-8 !px-3 !text-[11.5px]" />
          </div>
          <p className="mt-2 text-[11.5px] leading-relaxed text-dim">
            No install? Switch to <b className="text-fg/80">Agent fetches by link</b> — the prompt tells any agent with web access to read <code className="font-mono">/skill.md</code> itself.
          </p>
        </div>
      </div>
    </div>
  );
}
