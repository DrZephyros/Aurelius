import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/router";
import { TEMPLATES } from "@/lib/templates";
import { ALL_PROMPTS, CATEGORIES, fieldsOf, fillFields, type LibPrompt } from "@/lib/library";
import { CopyButton } from "@/components/copy-button";

const FAV_KEY = "aurelius:favs:v1";
const VAL_KEY = "aurelius:fields:v1";

function load<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
}
function save(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* best effort */
  }
}

/** Shows the prompt text with any still-unfilled [FIELD] highlighted. */
function Highlighted({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]\n]{2,70}\])/g);
  return (
    <>
      {parts.map((p, i) =>
        /^\[[^\]\n]{2,70}\]$/.test(p) ? (
          <mark key={i} className="rounded bg-aurora/15 px-1 text-aurora">{p}</mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

function PromptCard({
  p,
  fav,
  onFav,
  values,
  onValues,
  open,
  onOpen,
}: {
  p: LibPrompt;
  fav: boolean;
  onFav: () => void;
  values: Record<string, string>;
  onValues: (v: Record<string, string>) => void;
  open: boolean;
  onOpen: () => void;
}) {
  const fields = useMemo(() => fieldsOf(p.body), [p.body]);
  const filled = fillFields(p.body, values);
  const remaining = fields.filter((f) => !values[f]?.trim()).length;

  return (
    <div id={`p-${p.id}`} className={`panel flex flex-col p-6 transition ${open ? "md:col-span-2 xl:col-span-3 !border-aurora/30" : "hover:border-line-strong"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="chip">{p.category}</span>
          {p.tags.slice(0, 2).map((t) => (
            <span key={t} className="chip !border-transparent !bg-transparent !px-1.5">#{t}</span>
          ))}
        </div>
        <button
          type="button"
          onClick={onFav}
          aria-pressed={fav}
          aria-label={fav ? "Remove from favourites" : "Save to favourites"}
          className={`grid size-8 shrink-0 place-items-center rounded-full border transition ${fav ? "border-aurora/50 bg-aurora/10 text-aurora" : "border-line text-dim hover:text-fg"}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={fav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" /></svg>
        </button>
      </div>

      <h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.02em]">{p.title}</h3>
      <p className="mt-1.5 text-sm text-dim">{p.summary}</p>

      {!open ? (
        <p className="mt-4 line-clamp-3 flex-1 font-mono text-[12px] leading-relaxed text-white/45">{p.body}</p>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          {fields.length > 0 ? (
            <div className="space-y-3">
              <div className="font-mono text-[10.5px] tracking-[0.16em] text-dim uppercase">Fill in {fields.length} field{fields.length > 1 ? "s" : ""}</div>
              {fields.map((f) => (
                <label key={f} className="block">
                  <span className="mb-1 block text-xs text-dim">{f}</span>
                  <input
                    value={values[f] ?? ""}
                    onChange={(e) => onValues({ ...values, [f]: e.target.value })}
                    placeholder={f}
                    className="h-10 w-full rounded-xl border border-line bg-black/30 px-3 text-sm outline-none placeholder:text-dim/50 focus:border-aurora/60"
                  />
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-dim">Nothing to fill in — this prompt works as is.</p>
          )}
          <div className="min-w-0 rounded-2xl border border-line bg-black/30 p-4">
            <div className="mb-2 font-mono text-[10.5px] tracking-[0.16em] text-dim uppercase">Preview</div>
            <p className="max-h-72 overflow-auto whitespace-pre-wrap font-mono text-[12.5px] leading-relaxed text-white/75"><Highlighted text={filled} /></p>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <CopyButton text={filled} label={open && remaining === 0 && fields.length ? "Copy filled prompt" : "Copy"} />
        {fields.length > 0 && (
          <button type="button" onClick={onOpen} className="btn btn-ghost btn-sm">
            {open ? "Close" : `Customise · ${fields.length} field${fields.length > 1 ? "s" : ""}`}
          </button>
        )}
        {open && remaining > 0 && <span className="font-mono text-[10.5px] text-dim">{remaining} field{remaining > 1 ? "s" : ""} still blank</span>}
      </div>
    </div>
  );
}

export default function PromptsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [favs, setFavs] = useState<string[]>(() => load<string[]>(FAV_KEY, []));
  const [vals, setVals] = useState<Record<string, Record<string, string>>>(() => load(VAL_KEY, {}));
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => save(FAV_KEY, favs), [favs]);
  useEffect(() => save(VAL_KEY, vals), [vals]);

  /* deep-link from the command palette: #/prompts?open=<id> is not supported by the hash router, so use an event */
  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      setCat("All");
      setQ("");
      setOpen(id);
      setTimeout(() => document.getElementById(`p-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
    };
    window.addEventListener("aurelius:prompt", on);
    const pending = sessionStorage.getItem("aurelius:openPrompt");
    if (pending) {
      sessionStorage.removeItem("aurelius:openPrompt");
      on(new CustomEvent("aurelius:prompt", { detail: pending }));
    }
    return () => window.removeEventListener("aurelius:prompt", on);
  }, []);

  const cats = ["All", "Favourites", ...CATEGORIES];
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    return ALL_PROMPTS.filter((p) => {
      if (cat === "Favourites" ? !favs.includes(p.id) : cat !== "All" && p.category !== cat) return false;
      return !n || [p.title, p.summary, p.body, p.category, ...p.tags].join(" ").toLowerCase().includes(n);
    });
  }, [q, cat, favs]);

  const count = (c: string) => (c === "All" ? ALL_PROMPTS.length : c === "Favourites" ? favs.length : ALL_PROMPTS.filter((p) => p.category === c).length);
  const favText = ALL_PROMPTS.filter((p) => favs.includes(p.id)).map((p) => `## ${p.title}\n${fillFields(p.body, vals[p.id] ?? {})}`).join("\n\n");

  return (
    <main className="mx-auto max-w-[1320px] px-5 pb-28 pt-32 sm:px-8">
      <div className="eyebrow">Prompt library</div>
      <h1 className="h-display mt-6 text-[clamp(3rem,8vw,7rem)]">Aim your AI.</h1>
      <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-dim">
        {ALL_PROMPTS.length} tight, tested prompts for Claude Code, Cursor, Copilot, Lovable, Bolt and friends. Vague prompts burn tokens — these tell the AI exactly what to do and what <em>not</em> to touch.
        Hit <b className="text-fg">Customise</b>, fill the highlighted <span className="font-mono text-fg">[fields]</span>, copy.
      </p>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {[
          ["1", "Pick a prompt", "Search or filter by what you're stuck on."],
          ["2", "Fill the blanks", "Highlighted fields turn into inputs. Your answers are remembered."],
          ["3", "Paste into your AI tool", "One click copies the finished prompt."],
        ].map(([n, t, d]) => (
          <div key={n} className="panel flex items-start gap-4 p-5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-aurora font-mono text-xs font-semibold text-[#021510]">{n}</span>
            <div>
              <div className="font-display text-base font-semibold">{t}</div>
              <div className="mt-0.5 text-sm text-dim">{d}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="sticky top-[76px] z-30 -mx-5 mt-10 border-y border-line bg-bg/85 px-5 py-4 backdrop-blur-xl sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block lg:w-80">
            <span className="sr-only">Search prompts</span>
            <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dim" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: auth, bug, mobile, stripe…" className="h-11 w-full rounded-full border border-line bg-white/[0.03] pl-11 pr-4 text-sm outline-none placeholder:text-dim/70 focus:border-aurora/60" />
          </label>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-1 lg:flex-wrap lg:overflow-visible lg:px-0" role="tablist" aria-label="Prompt categories">
            {cats.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={cat === c}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] transition ${cat === c ? "border-aurora bg-aurora text-[#021510]" : "border-line text-dim hover:border-line-strong hover:text-fg"}`}
              >
                {c === "Favourites" ? "★ " : ""}{c} <span className="opacity-60">{count(c)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {cat === "Favourites" && favs.length > 0 && (
        <div className="mt-6 flex items-center gap-3">
          <CopyButton text={favText} label="Copy all favourites" />
          <span className="text-sm text-dim">Merge your saved prompts into one block — handy for a project's setup message.</span>
        </div>
      )}

      {shown.length === 0 ? (
        <div className="panel mt-8 p-12 text-center text-dim">
          {cat === "Favourites" && !q ? "No favourites yet — tap the ★ on any prompt to save it here." : <>No prompt matches. <button className="text-aurora underline" onClick={() => { setQ(""); setCat("All"); }}>Reset</button></>}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => (
            <PromptCard
              key={p.id}
              p={p}
              fav={favs.includes(p.id)}
              onFav={() => setFavs((f) => (f.includes(p.id) ? f.filter((x) => x !== p.id) : [...f, p.id]))}
              values={vals[p.id] ?? {}}
              onValues={(v) => setVals((s) => ({ ...s, [p.id]: v }))}
              open={open === p.id}
              onOpen={() => setOpen(open === p.id ? null : p.id)}
            />
          ))}
        </div>
      )}

      <section className="mt-24">
        <h2 className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase">Template-specific prompts live on each template</h2>
        <div className="mt-5 flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <Link key={t.slug} href={`/templates/${t.slug}#prompts`} className="chip !h-9 !px-4 !text-[11px] transition hover:!text-fg" style={{ borderColor: `${t.accent}44` }}>
              <i className="size-1.5 rotate-45" style={{ background: t.accent }} /> {t.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
