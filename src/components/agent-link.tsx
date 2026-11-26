"use client";

import { useEffect, useState } from "react";

const KEY = "aurelius:agent-link:v1";
type Issued = { url: string; prompt: string; pub?: boolean };

/** The public library URL — no token, no signup, works with no database and can be shared or crawled. */
function publicLink(): Issued {
  const origin = typeof location !== "undefined" ? location.origin : "https://projectaurelius.dev";
  return {
    url: `${origin}/llms.txt`,
    prompt: `I'm giving you access to the Aurelius library, a free collection of 3D landing pages, React components, app pages and prompts.\n\nRead this first: ${origin}/llms.txt\n\nThen, for the site I'm building, fetch only the items from that index that fit (each link returns full source plus usage notes), adapt them to my brand and brief, and tell me which ones you used.`,
    pub: true,
  };
}

/** Copy the link (or a paste-ready prompt). Public by default; a private tracked link is optional. */
export function AgentLink({ counts }: { counts?: { label: string; n: number }[] }) {
  const [link, setLink] = useState<Issued | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState<"" | "link" | "prompt">("");
  const [tab, setTab] = useState<"link" | "prompt">("link");

  useEffect(() => {
    setLink(publicLink());
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const j = JSON.parse(raw) as Issued;
        // links are bound to the origin that issued them
        if (j.url?.startsWith(location.origin)) setLink(j);
      }
    } catch { /* private mode */ }
  }, []);

  const issue = async () => {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/agent-link", { method: "POST" });
      if (!r.ok) throw new Error("Could not issue a link — try again.");
      const j = (await r.json()) as Issued;
      setLink(j);
      try { localStorage.setItem(KEY, JSON.stringify(j)); } catch { /* ignore */ }
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };

  const copy = async (what: "link" | "prompt") => {
    if (!link) return;
    const text = what === "link" ? link.url : link.prompt;
    try { await navigator.clipboard.writeText(text); }
    catch {
      const t = document.createElement("textarea"); t.value = text; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove();
    }
    setCopied(what);
    setTimeout(() => setCopied(""), 1800);
  };

  return (
    <div id="agent" className="relative scroll-mt-28 overflow-hidden rounded-[28px] border border-[rgb(92_255_196/0.28)] bg-[linear-gradient(135deg,rgb(8_18_28/0.9),rgb(5_8_16/0.92))] p-6 backdrop-blur-xl sm:p-9">
      <div className="pointer-events-none absolute -right-24 -top-24 size-[340px] rounded-full bg-[radial-gradient(closest-side,rgb(92_255_196/0.18),transparent)]" />
      <div className="relative grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div>
          <div className="eyebrow">Agent link · free</div>
          <h2 className="h-display mt-4 text-[clamp(1.9rem,3.6vw,3rem)]">One link.<br />Your agent gets the <span className="aurora-text">whole library.</span></h2>
          <p className="mt-4 max-w-[460px] text-[14.5px] leading-relaxed text-dim">
            Paste it into Claude, ChatGPT, Cursor, Codex, Lovable — anything that can open a URL. It reads the index, picks what fits your project and pulls the full source of each piece as it builds.
          </p>
          {counts && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {counts.map((c) => (<li key={c.label} className="chip"><b className="text-aurora">{c.n}</b> {c.label}</li>))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-black/40 p-4 sm:p-5">
          {!link ? (
            <div className="py-3 text-center">
              <p className="text-[13.5px] text-dim">Loading the public library link…</p>
            </div>
          ) : (
            <div>
              <div className="flex gap-1 text-[12px]" role="tablist">
                {([["link", "The link"], ["prompt", "Paste-ready prompt"]] as const).map(([k, l]) => (
                  <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-full px-3.5 py-1.5 transition ${tab === k ? "bg-white/14 text-fg" : "text-dim hover:text-fg"}`}>{l}</button>
                ))}
              </div>
              <pre className="link-well mt-3 max-h-[170px] overflow-auto rounded-xl border border-line bg-black/50 p-3.5 break-all whitespace-pre-wrap text-fg/90">{tab === "link" ? link.url : link.prompt}</pre>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => copy(tab)} className="btn btn-primary h-[46px] px-6 text-[14px]">{copied === tab ? "Copied ✓" : tab === "link" ? "Copy link" : "Copy prompt"}</button>
                <button type="button" onClick={() => copy(tab === "link" ? "prompt" : "link")} className="btn btn-ghost h-[46px] px-5 text-[13px]">{copied && copied !== tab ? "Copied ✓" : tab === "link" ? "Copy the prompt instead" : "Copy just the link"}</button>
                <a href={link.url} target="_blank" rel="noreferrer" className="px-2 text-[12.5px] text-dim underline-offset-4 hover:text-fg hover:underline">Preview what the agent sees ↗</a>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
                {link.pub ? (
                  <>
                    <span className="text-[11.5px] text-dim">Public link · no signup · works in any agent</span>
                    <button type="button" onClick={issue} disabled={busy} className="text-[11.5px] text-dim underline-offset-4 hover:text-fg hover:underline">{busy ? "issuing…" : "or get a private tracked link"}</button>
                  </>
                ) : (
                  <>
                    <span className="text-[11.5px] text-dim">Private link — anyone with it can read the library.</span>
                    <button type="button" onClick={() => setLink(publicLink())} className="text-[11.5px] text-dim underline-offset-4 hover:text-fg hover:underline">switch to the public link</button>
                  </>
                )}
              </div>
              {err && <p role="alert" className="mt-2 text-[12px] text-[#ff8a8a]">{err}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
