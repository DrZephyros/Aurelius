import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CopyButton } from "@/components/copy-button";

/* ───────── shared bits ───────── */
const inputCls = "w-full rounded-xl border border-line bg-black/30 px-3.5 py-2.5 text-sm outline-none placeholder:text-dim/50 focus:border-aurora/60";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-3 text-xs text-dim">
        <span>{label}</span>
        {hint && <span className="text-[10.5px] opacity-70">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Output({ text, file }: { text: string; file?: string }) {
  return (
    <div className="panel flex min-h-0 flex-col p-5 lg:sticky lg:top-24 lg:self-start">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="font-mono text-[10.5px] tracking-[0.16em] text-dim uppercase">{file ?? "Output"}</span>
        <div className="flex gap-2">
          {file && (
            <button type="button" onClick={() => download(file.split("/").pop() || file, text)} className="btn btn-ghost btn-sm">Download</button>
          )}
          <CopyButton text={text} label="Copy" />
        </div>
      </div>
      <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded-2xl border border-line bg-black/30 p-4 font-mono text-[12.5px] leading-relaxed text-white/75">{text}</pre>
    </div>
  );
}

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-[12.5px] transition ${on ? "border-aurora/60 bg-aurora/10 text-aurora" : "border-line text-dim hover:text-fg"}`}
    >
      {children}
    </button>
  );
}

const useStored = <T,>(key: string, init: T) => {
  const [v, setV] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? ({ ...init, ...JSON.parse(s) } as T) : init;
    } catch {
      return init;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {
      /* ignore */
    }
  }, [key, v]);
  return [v, setV] as const;
};

/* ───────── 1. rules file generator ───────── */
const STACKS = ["React", "Next.js", "Vite", "TypeScript", "Tailwind CSS", "shadcn/ui", "Supabase", "Firebase", "Prisma", "Postgres", "Node + Express", "Python + FastAPI", "Stripe", "Three.js"];
const RULES: [string, string][] = [
  ["plan", "Plan first: for any task bigger than a one-line fix, post a short plan and wait for approval."],
  ["small", "Keep diffs small. Touch only the files a task needs; no drive-by refactors or renames."],
  ["deps", "Do not add dependencies without asking. Prefer the platform and what is already installed."],
  ["strict", "TypeScript strict mode. No `any`, no non-null assertions without a comment explaining why."],
  ["tests", "Add or update tests for any logic that handles money, permissions, parsing or state transitions."],
  ["secrets", "Never read, print or commit .env files or secrets. Use .env.example for documentation."],
  ["mobile", "Mobile-first. Check layouts at 375px, 768px and 1280px; tap targets are at least 44px."],
  ["a11y", "Accessibility: semantic HTML, labelled controls, visible focus, WCAG AA contrast."],
  ["explain", "After each task, summarise what changed in 3 bullets and how to test it manually."],
];

function RulesTool() {
  const [s, setS] = useStored("aurelius:tool:rules", {
    file: "AGENTS.md", name: "My App", about: "", stack: ["React", "Vite", "TypeScript", "Tailwind CSS"],
    rules: ["plan", "small", "deps", "secrets", "explain"], dev: "npm run dev", build: "npm run build", test: "npm test", protect: "",
  });
  const set = (p: Partial<typeof s>) => setS({ ...s, ...p });
  const flip = (k: "stack" | "rules", v: string) => set({ [k]: s[k].includes(v) ? s[k].filter((x) => x !== v) : [...s[k], v] } as Partial<typeof s>);
  const text = [
    `# ${s.name}`,
    s.about && `\n${s.about}`,
    `\n## Stack\n${s.stack.length ? s.stack.map((x) => `- ${x}`).join("\n") : "- (not specified)"}`,
    `\n## Commands\n- Dev: \`${s.dev}\`\n- Build: \`${s.build}\`\n- Test: \`${s.test}\``,
    `\n## Rules\n${RULES.filter(([id]) => s.rules.includes(id)).map(([, t]) => `- ${t}`).join("\n")}`,
    s.protect.trim() && `\n## Protected — ask before changing\n${s.protect.split("\n").filter(Boolean).map((l) => `- ${l.trim()}`).join("\n")}`,
    `\n## Definition of done\n- \`${s.build}\` passes with no errors or type errors\n- The feature works in the browser (state how you checked)\n- No unrelated files changed`,
  ].filter(Boolean).join("\n");

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-5">
        <Field label="Which tool?" hint="same content, different filename">
          <div className="flex flex-wrap gap-2">
            {["AGENTS.md", "CLAUDE.md", ".cursorrules", ".github/copilot-instructions.md"].map((f) => (
              <Toggle key={f} on={s.file === f} onClick={() => set({ file: f })}>{f}</Toggle>
            ))}
          </div>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Project name"><input className={inputCls} value={s.name} onChange={(e) => set({ name: e.target.value })} /></Field>
          <Field label="One-line description"><input className={inputCls} value={s.about} onChange={(e) => set({ about: e.target.value })} placeholder="A habit tracker for freelancers" /></Field>
        </div>
        <Field label="Stack"><div className="flex flex-wrap gap-2">{STACKS.map((x) => <Toggle key={x} on={s.stack.includes(x)} onClick={() => flip("stack", x)}>{x}</Toggle>)}</div></Field>
        <Field label="Rules for the AI"><div className="flex flex-wrap gap-2">{RULES.map(([id, t]) => <Toggle key={id} on={s.rules.includes(id)} onClick={() => flip("rules", id)}>{t.split(":")[0].split(".")[0]}</Toggle>)}</div></Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Dev"><input className={inputCls} value={s.dev} onChange={(e) => set({ dev: e.target.value })} /></Field>
          <Field label="Build"><input className={inputCls} value={s.build} onChange={(e) => set({ build: e.target.value })} /></Field>
          <Field label="Test"><input className={inputCls} value={s.test} onChange={(e) => set({ test: e.target.value })} /></Field>
        </div>
        <Field label="Protected paths" hint="one per line"><textarea className={inputCls + " min-h-20"} value={s.protect} onChange={(e) => set({ protect: e.target.value })} placeholder={"src/lib/auth.ts\nsupabase/migrations/"} /></Field>
      </div>
      <Output text={text} file={s.file} />
    </div>
  );
}

/* ───────── 2. kickoff prompt builder ───────── */
function KickoffTool() {
  const [s, setS] = useStored("aurelius:tool:kickoff", { idea: "", user: "", features: "", stack: "React + Vite + Tailwind", vibe: "clean, modern, minimal", out: "Build only the landing page + sign-up flow first" });
  const set = (p: Partial<typeof s>) => setS({ ...s, ...p });
  const feats = s.features.split("\n").map((f) => f.trim()).filter(Boolean);
  const text = `You are my senior full-stack engineer and product designer. I'm a solo builder using AI to ship fast.

## The product
${s.idea || "[Describe your app in one or two sentences]"}

## Who it's for
${s.user || "[Target user]"}

## v1 must-haves
${feats.length ? feats.map((f, i) => `${i + 1}. ${f}`).join("\n") : "1. [Feature one]\n2. [Feature two]\n3. [Feature three]"}

## Tech
${s.stack}. Keep dependencies minimal and well-known.

## Look & feel
${s.vibe}. No placeholder lorem ipsum — write realistic copy.

## How to work
1. Before coding, restate the product in your words and list any questions. Wait for my answers.
2. Then propose the folder structure and data model. Wait for approval.
3. Build in small steps. After each step, tell me what to test.
4. Do not add features I did not list. If you think something is missing, ask.

## Right now
${s.out}`;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-4">
        <Field label="What are you building?"><textarea className={inputCls + " min-h-24"} value={s.idea} onChange={(e) => set({ idea: e.target.value })} placeholder="A tiny CRM for wedding photographers that sends invoices automatically" /></Field>
        <Field label="Who is it for?"><input className={inputCls} value={s.user} onChange={(e) => set({ user: e.target.value })} placeholder="Solo wedding photographers" /></Field>
        <Field label="Must-have features" hint="one per line"><textarea className={inputCls + " min-h-28"} value={s.features} onChange={(e) => set({ features: e.target.value })} placeholder={"Client list\nInvoice builder\nPayment reminders"} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Stack"><input className={inputCls} value={s.stack} onChange={(e) => set({ stack: e.target.value })} /></Field>
          <Field label="Vibe"><input className={inputCls} value={s.vibe} onChange={(e) => set({ vibe: e.target.value })} /></Field>
        </div>
        <Field label="What should the AI do first?"><input className={inputCls} value={s.out} onChange={(e) => set({ out: e.target.value })} /></Field>
      </div>
      <Output text={text} file="kickoff-prompt.md" />
    </div>
  );
}

/* ───────── 3. bug → prompt ───────── */
function BugTool() {
  const [s, setS] = useStored("aurelius:tool:bug", { err: "", did: "", expected: "", file: "", changed: "", attempts: "" });
  const set = (p: Partial<typeof s>) => setS({ ...s, ...p });
  const text = `Help me debug this. Do NOT rewrite code yet.

## Error / symptom
${s.err.trim() ? "```\n" + s.err.trim() + "\n```" : "[paste the error or describe what is wrong]"}

## What I did
${s.did || "[steps to reproduce]"}

## What I expected
${s.expected || "[expected behaviour]"}

## Where I think it is
${s.file || "[file or component, if you know]"}

## What changed recently
${s.changed || "[last change before it broke]"}
${s.attempts.trim() ? `\n## Already tried (did not work)\n${s.attempts.trim()}\n` : ""}
## How to answer
1. Explain the most likely root cause in plain language and point to the exact file and line.
2. Give the smallest possible fix — no refactors, no renames.
3. Tell me how to confirm it's fixed.
4. If you need more information, ask for it instead of guessing.`;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-4">
        <Field label="Error message or stack trace"><textarea className={inputCls + " min-h-32 font-mono text-xs"} value={s.err} onChange={(e) => set({ err: e.target.value })} placeholder="TypeError: Cannot read properties of undefined (reading 'map')…" /></Field>
        <Field label="What did you do?"><input className={inputCls} value={s.did} onChange={(e) => set({ did: e.target.value })} placeholder="Clicked 'Save' on the settings page" /></Field>
        <Field label="What should have happened?"><input className={inputCls} value={s.expected} onChange={(e) => set({ expected: e.target.value })} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="File / component"><input className={inputCls} value={s.file} onChange={(e) => set({ file: e.target.value })} placeholder="src/pages/Settings.tsx" /></Field>
          <Field label="Last thing you changed"><input className={inputCls} value={s.changed} onChange={(e) => set({ changed: e.target.value })} /></Field>
        </div>
        <Field label="Already tried" hint="optional"><textarea className={inputCls + " min-h-20"} value={s.attempts} onChange={(e) => set({ attempts: e.target.value })} /></Field>
      </div>
      <Output text={text} file="debug-prompt.md" />
    </div>
  );
}

/* ───────── 4. token counter ───────── */
const WINDOWS: [string, number][] = [["8k", 8_000], ["32k", 32_000], ["128k", 128_000], ["200k", 200_000], ["1M", 1_000_000]];
const PRICES: [string, number][] = [["Budget · $0.15", 0.15], ["Mid · $1", 1], ["Pro · $3", 3], ["Frontier · $15", 15]];

function TokenTool() {
  const [text, setText] = useState("");
  const [price, setPrice] = useState(3);
  const [turns, setTurns] = useState(10);
  const m = useMemo(() => {
    const chars = text.length, words = (text.trim().match(/\S+/g) || []).length;
    const tokens = Math.ceil(chars / 4);
    return { chars, words, lines: text ? text.split("\n").length : 0, tokens };
  }, [text]);
  const cost = (m.tokens / 1e6) * price;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div>
        <Field label="Paste a prompt, file or whole conversation" hint="nothing leaves your browser">
          <textarea className={inputCls + " min-h-[360px] font-mono text-xs"} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste anything to estimate how many tokens it costs…" />
        </Field>
      </div>
      <div className="space-y-4">
        <div className="panel grid grid-cols-2 gap-4 p-5">
          {[["Tokens (est.)", m.tokens.toLocaleString()], ["Characters", m.chars.toLocaleString()], ["Words", m.words.toLocaleString()], ["Lines", m.lines.toLocaleString()]].map(([k, v]) => (
            <div key={k}>
              <div className="font-display text-3xl font-semibold tracking-[-0.04em]">{v}</div>
              <div className="mt-1 font-mono text-[10.5px] tracking-[0.14em] text-dim uppercase">{k}</div>
            </div>
          ))}
        </div>
        <div className="panel p-5">
          <div className="font-mono text-[10.5px] tracking-[0.16em] text-dim uppercase">Context window usage</div>
          <div className="mt-4 space-y-3">
            {WINDOWS.map(([l, n]) => {
              const pct = Math.min(100, (m.tokens / n) * 100);
              return (
                <div key={l} className="grid grid-cols-[44px_1fr_52px] items-center gap-3 text-xs">
                  <span className="font-mono text-dim">{l}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct > 80 ? "#ff7a59" : "var(--color-aurora)" }} /></div>
                  <span className="text-right font-mono text-dim">{pct < 0.1 && m.tokens ? "<0.1" : pct.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="panel p-5">
          <div className="font-mono text-[10.5px] tracking-[0.16em] text-dim uppercase">Input cost</div>
          <div className="mt-3 flex flex-wrap gap-2">{PRICES.map(([l, v]) => <Toggle key={l} on={price === v} onClick={() => setPrice(v)}>{l}</Toggle>)}</div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Field label="$ per 1M input tokens"><input type="number" min={0} step={0.05} className={inputCls} value={price} onChange={(e) => setPrice(Math.max(0, +e.target.value))} /></Field>
            <Field label="Re-sent in N turns"><input type="number" min={1} className={inputCls} value={turns} onChange={(e) => setTurns(Math.max(1, +e.target.value))} /></Field>
          </div>
          <p className="mt-4 text-sm text-dim">
            Once: <b className="text-fg">${cost < 0.01 ? cost.toFixed(4) : cost.toFixed(3)}</b> · over {turns} turns: <b className="text-fg">${(cost * turns).toFixed(cost * turns < 0.1 ? 4 : 2)}</b>
          </p>
          <p className="mt-3 font-mono text-[10.5px] leading-relaxed text-dim">Estimate: tokens ≈ characters ÷ 4. Real tokenisers differ by model; use your provider's prices in the field above. Long chats re-send history every turn — start fresh chats often.</p>
        </div>
      </div>
    </div>
  );
}

/* ───────── 5. palette → tokens ───────── */
function lum(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const hexOk = (v: string) => /^#[0-9a-f]{6}$/i.test(v);

function PaletteTool() {
  const [c, setC] = useStored("aurelius:tool:palette", { bg: "#04060c", surface: "#080c15", text: "#e9f1f5", muted: "#8b9bae", accent: "#5cffc4" });
  const keys = Object.keys(c) as (keyof typeof c)[];
  const safe = (k: keyof typeof c) => (hexOk(c[k]) ? c[k] : "#000000");
  const checks: [string, string, string][] = [["Text on background", c.text, c.bg], ["Muted on background", c.muted, c.bg], ["Accent on background", c.accent, c.bg], ["Background on accent (buttons)", c.bg, c.accent]];
  const css = `:root {\n${keys.map((k) => `  --${k}: ${c[k]};`).join("\n")}\n}`;
  const tw = `@theme {\n${keys.map((k) => `  --color-${k}: ${c[k]};`).join("\n")}\n}`;
  const prompt = `Apply this colour palette across the whole app. Replace hard-coded colours with these semantic tokens and do not change layout.\n\n${keys.map((k) => `${k}: ${c[k]}`).join("\n")}\n\nUse "background" for the page, "surface" for cards, "text"/"muted" for copy, "accent" for buttons, links and focus rings. Keep all text at WCAG AA contrast or better.`;
  const text = `/* CSS variables */\n${css}\n\n/* Tailwind v4 */\n${tw}\n\n/* AI prompt */\n${prompt}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {keys.map((k) => (
            <Field key={k} label={k[0].toUpperCase() + k.slice(1)}>
              <div className="flex items-center gap-2">
                <input type="color" value={safe(k)} onChange={(e) => setC({ ...c, [k]: e.target.value })} className="h-10 w-12 cursor-pointer rounded-lg border border-line bg-transparent p-1" aria-label={`${k} colour`} />
                <input className={inputCls + " font-mono"} value={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.value })} maxLength={7} />
              </div>
            </Field>
          ))}
        </div>
        <div className="rounded-3xl border border-line p-6" style={{ background: safe("bg"), color: safe("text") }}>
          <div className="rounded-2xl border p-5" style={{ background: safe("surface"), borderColor: "rgb(255 255 255 / 0.1)" }}>
            <div className="font-display text-2xl font-semibold tracking-[-0.03em]">Preview card</div>
            <p className="mt-1 text-sm" style={{ color: safe("muted") }}>This is how your tokens look together.</p>
            <button className="mt-4 rounded-full px-5 py-2 text-sm font-semibold" style={{ background: safe("accent"), color: safe("bg") }}>Primary action</button>
            <a className="ml-4 text-sm underline" style={{ color: safe("accent") }}>A link</a>
          </div>
        </div>
        <div className="panel divide-y divide-line">
          {checks.map(([l, fg, bg]) => {
            const r = hexOk(fg) && hexOk(bg) ? ratio(fg, bg) : 0;
            return (
              <div key={l} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <span className="text-dim">{l}</span>
                <span className="flex items-center gap-2 font-mono text-xs">
                  {r.toFixed(2)}:1
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${r >= 4.5 ? "bg-aurora/15 text-aurora" : r >= 3 ? "bg-yellow-400/15 text-yellow-300" : "bg-red-500/15 text-red-300"}`}>{r >= 7 ? "AAA" : r >= 4.5 ? "AA" : r >= 3 ? "AA large" : "Fail"}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <Output text={text} file="palette.css" />
    </div>
  );
}

/* ───────── 6. ship checklist ───────── */
const CHECKLIST: [string, string[]][] = [
  ["Product", ["One sentence explains what it does", "A new user can finish the main flow in under 2 minutes", "Empty, loading and error states exist", "Copy has no lorem ipsum or TODOs"]],
  ["Quality", ["Build passes with zero errors", "No console errors on any page", "Works at 375px wide", "Keyboard-only navigation works", "Text contrast is AA"]],
  ["Security", ["No secrets in client code or git history", "Every API route checks who is asking", "Database rules block other users' data", "Rate limiting on login and expensive endpoints"]],
  ["Launch", ["Custom domain with HTTPS", "Page titles, descriptions and share image set", "Favicon and 404 page", "Analytics installed", "Error monitoring installed", "Backups or export for user data"]],
  ["After launch", ["Told 10 real people", "A way for users to contact you", "A list of the first 5 things to fix"]],
];

function ChecklistTool() {
  const [done, setDone] = useStored<Record<string, boolean>>("aurelius:tool:ship", {});
  const total = CHECKLIST.reduce((a, [, i]) => a + i.length, 0);
  const n = Object.values(done).filter(Boolean).length;
  return (
    <div className="mx-auto max-w-3xl">
      <div className="panel p-6">
        <div className="flex items-end justify-between">
          <div className="font-display text-4xl font-semibold tracking-[-0.04em]">{n}<span className="text-dim"> / {total}</span></div>
          <button className="text-sm text-dim underline hover:text-fg" onClick={() => setDone({})}>Reset</button>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-aurora transition-[width] duration-500" style={{ width: `${(n / total) * 100}%` }} /></div>
        <p className="mt-3 text-sm text-dim">{n === total ? "Everything checked. Ship it." : "Saved in your browser. Tick things off as you go."}</p>
      </div>
      {CHECKLIST.map(([g, items]) => (
        <section key={g} className="mt-8">
          <h3 className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase">{g}</h3>
          <div className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line">
            {items.map((it) => {
              const k = g + ":" + it;
              return (
                <label key={k} className="flex cursor-pointer items-center gap-4 bg-white/[0.02] px-5 py-3.5 text-[15px] transition hover:bg-white/[0.05]">
                  <input type="checkbox" checked={!!done[k]} onChange={() => setDone({ ...done, [k]: !done[k] })} className="size-5 accent-[#5cffc4]" />
                  <span className={done[k] ? "text-dim line-through" : ""}>{it}</span>
                </label>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ───────── page ───────── */
export const TOOLS = [
  { id: "rules", name: "Rules file", desc: "Generate AGENTS.md / CLAUDE.md / .cursorrules", icon: "M4 5h16M4 12h10M4 19h16", C: RulesTool },
  { id: "kickoff", name: "Kickoff prompt", desc: "Turn an idea into a first prompt that works", icon: "M5 3l14 9-14 9V3Z", C: KickoffTool },
  { id: "bug", name: "Bug → prompt", desc: "Structure an error so the AI fixes it first time", icon: "M12 8v5m0 4h.01M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z", C: BugTool },
  { id: "tokens", name: "Token counter", desc: "Estimate size, context fill and cost", icon: "M4 7h16M4 12h16M4 17h10", C: TokenTool },
  { id: "palette", name: "Palette → tokens", desc: "Contrast check + CSS, Tailwind and prompt", icon: "M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.6-.3-1-.5-1.4-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4A3.6 3.6 0 0 0 21 10.7C21 6.4 17 3 12 3Z", C: PaletteTool },
  { id: "ship", name: "Ship checklist", desc: "22 things to check before you launch", icon: "m5 12 5 5L20 7", C: ChecklistTool },
] as const;

export default function ToolsPage() {
  const [tab, setTab] = useState<string>(() => {
    const s = sessionStorage.getItem("aurelius:tool");
    sessionStorage.removeItem("aurelius:tool");
    return s && TOOLS.some((t) => t.id === s) ? s : "rules";
  });
  useEffect(() => {
    const on = (e: Event) => setTab((e as CustomEvent<string>).detail);
    window.addEventListener("aurelius:tool", on);
    return () => window.removeEventListener("aurelius:tool", on);
  }, []);
  const cur = TOOLS.find((t) => t.id === tab) ?? TOOLS[0];
  const Cur = cur.C;

  return (
    <main className="mx-auto max-w-[1320px] px-5 pb-28 pt-32 sm:px-8">
      <div className="eyebrow">Vibe toolkit</div>
      <h1 className="h-display mt-6 text-[clamp(3rem,8vw,7rem)]">Small tools, big leverage.</h1>
      <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-dim">Everything runs in your browser and saves as you type. No accounts, no uploads — just the glue work that makes AI-assisted building less painful.</p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="tablist" aria-label="Tools">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`panel flex items-center gap-4 p-4 text-left transition ${tab === t.id ? "!border-aurora/50 !bg-aurora/[0.05]" : "hover:border-line-strong"}`}
          >
            <span className={`grid size-11 shrink-0 place-items-center rounded-xl border ${tab === t.id ? "border-aurora/50 text-aurora" : "border-line text-dim"}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={t.icon} /></svg>
            </span>
            <span className="min-w-0">
              <span className="block font-display text-[17px] font-semibold tracking-[-0.02em]">{t.name}</span>
              <span className="block truncate text-[13px] text-dim">{t.desc}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mt-10" key={cur.id}><Cur /></div>
    </main>
  );
}
