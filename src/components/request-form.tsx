"use client";

import { useState } from "react";
import { TEMPLATES } from "@/lib/templates";
import { TIERS } from "@/lib/site";

const KINDS = ["Product launch", "Real estate / hospitality", "Portfolio / personal", "Brand / agency", "SaaS / AI", "Game / film / event", "Food / lifestyle", "Something else"];
const BUDGETS = ["$2k – $5k", "$5k – $10k", "$10k – $20k", "$20k+", "Not sure yet"];

const inp = "h-[50px] w-full rounded-2xl border border-line bg-black/40 px-4 text-[14.5px] outline-none transition focus:border-aurora";

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (<label className="block"><span className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-dim uppercase">{label}</span>{children}</label>);
}

/** "Request a website from me" — posts to /api/requests (stored in Postgres). */
export function RequestForm({ onDone, plan, template }: { onDone?: () => void; plan?: "build"; template?: string }) {
  const [v, setV] = useState({ name: "", email: "", company: "", kind: KINDS[0], budget: BUDGETS[1], timeline: "", brief: "", links: "", base: template ?? "Not sure — recommend one" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setV((s) => ({ ...s, [k]: e.target.value }));
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/requests", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(plan === "build" ? { ...v, kind: `${v.kind} · BUILD ${TIERS.build.label} · base: ${v.base}`, budget: `${TIERS.build.label} fixed (1 revision, 5 days)` } : v) });
      const j = (await r.json()) as { error?: string };
      if (!r.ok) throw new Error(j.error || "Could not send");
      onDone?.();
    } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <F label="Your name"><input required className={inp} value={v.name} onChange={set("name")} autoComplete="name" /></F>
        <F label="Email"><input required type="email" className={inp} value={v.email} onChange={set("email")} autoComplete="email" /></F>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <F label="Company / project"><input className={inp} value={v.company} onChange={set("company")} /></F>
        <F label="Type of site"><select className={inp} value={v.kind} onChange={set("kind")}>{KINDS.map((k) => <option key={k} className="bg-[#0a0f18]">{k}</option>)}</select></F>
      </div>
      {plan === "build" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Start from which template?"><select className={inp} value={v.base} onChange={set("base")}><option className="bg-[#0a0f18]">Not sure — recommend one</option>{TEMPLATES.map((t) => <option key={t.slug} value={t.name} className="bg-[#0a0f18]">{t.name} — {t.tagline}</option>)}</select></F>
          <F label="Deadline (optional)"><input className={inp} value={v.timeline} onChange={set("timeline")} placeholder="e.g. needed by the 14th" /></F>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="Budget"><select className={inp} value={v.budget} onChange={set("budget")}>{BUDGETS.map((k) => <option key={k} className="bg-[#0a0f18]">{k}</option>)}</select></F>
          <F label="Timeline"><input className={inp} value={v.timeline} onChange={set("timeline")} placeholder="e.g. launch in 6 weeks" /></F>
        </div>
      )}
      <F label="The brief"><textarea required minLength={20} rows={5} className={`${inp} h-auto py-3`} value={v.brief} onChange={set("brief")} placeholder="What is it, who is it for, how should people feel, what should they do at the end?" /></F>
      <F label="Links (references, brand, current site)"><input className={inp} value={v.links} onChange={set("links")} /></F>
      {err && <p role="alert" className="text-[13px] text-[#ff8a8a]">{err}</p>}
      <button disabled={busy} className="btn btn-primary h-[54px] w-full text-[15px] disabled:opacity-60">{busy ? "Sending…" : plan === "build" ? `Book my build — ${TIERS.build.label}` : "Send the request"}</button>
    </form>
  );
}
