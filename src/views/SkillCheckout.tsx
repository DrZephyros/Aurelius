"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/router";
import { SKILL_STATS } from "@/lib/skill";
import { SkillPrompt } from "@/components/skill-prompt";
import { SKILL } from "@/lib/site";

export function CheckoutPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
      const j = (await r.json()) as { url?: string; error?: string };
      if (!r.ok || !j.url) throw new Error(j.error || "Something went wrong");
      window.location.href = j.url;
    } catch (x) {
      setErr((x as Error).message); setBusy(false);
    }
  };
  return (
    <main className="mx-auto grid max-w-[1100px] gap-10 px-5 pb-28 pt-36 sm:px-8 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <Link href="/services#skill" className="text-[13px] text-dim hover:text-fg">← Back to the skill</Link>
        <div className="eyebrow mt-6">Checkout</div>
        <h1 className="h-display mt-4 text-[clamp(2.4rem,5vw,4.2rem)]">Get AURA.</h1>
        <p className="mt-4 max-w-[460px] text-dim">Enter your email — your receipt and download link go there. You get the skill folder, the single-file edition and the starter engine.</p>
        <form onSubmit={submit} className="mt-8 max-w-[460px] space-y-4">
          <label className="block"><span className="mb-1.5 block font-mono text-[10px] tracking-[0.2em] text-dim uppercase">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" className="h-[54px] w-full rounded-2xl border border-line bg-black/40 px-5 text-[15px] outline-none transition focus:border-aurora" /></label>
          {err && <p role="alert" className="text-[13px] text-[#ff8a8a]">{err}</p>}
          <button disabled={busy} className="btn btn-primary h-[56px] w-full text-[16px] disabled:opacity-60">{busy ? "One moment…" : `Pay ${SKILL.priceLabel} & download`}</button>
          <p className="text-center text-[12px] text-dim">One-time payment · instant access · unlimited projects</p>
        </form>
      </div>
      <aside className="panel h-fit !rounded-[24px] p-6">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-dim uppercase">Order summary</div>
        <div className="mt-4 flex items-start justify-between gap-4"><div><b className="font-display text-xl">AURA — 3D website skill</b><p className="mt-1 text-[13px] text-dim">v{SKILL.version} · {SKILL_STATS.files} files · {SKILL_STATS.kb} KB</p></div><b className="font-display text-xl">{SKILL.priceLabel}</b></div>
        <ul className="mt-5 space-y-2 border-t border-line pt-5 text-[13px] text-fg/75">
          <li>✦ 12 art directions + signature moves</li><li>✦ {SKILL_STATS.examples} worked examples</li><li>✦ Cinematic engine + 3 reference worlds</li><li>✦ QA gate script</li><li>✦ Free 2.x updates</li>
        </ul>
      </aside>
    </main>
  );
}

export function DownloadPage() {
  const [token, setToken] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [state, setState] = useState<"loading" | "ok" | "bad">("loading");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    setPreview(q.get("mode") === "preview");
    const t = q.get("token"), sid = q.get("session_id");
    if (t) { setToken(t); setState("ok"); return; }
    if (!sid) { setState("bad"); setMsg("This download link is missing its token."); return; }
    fetch(`/api/orders/verify?session_id=${encodeURIComponent(sid)}`).then(async (r) => {
      const j = (await r.json()) as { token?: string; error?: string };
      if (r.ok && j.token) { setToken(j.token); setState("ok"); } else { setState("bad"); setMsg(j.error || "We couldn't confirm the payment."); }
    }).catch(() => { setState("bad"); setMsg("Network error — refresh to retry."); });
  }, []);
  const dl = (k: string) => `/api/download?token=${token}&kind=${k}`;
  return (
    <main className="mx-auto max-w-[900px] px-5 pb-28 pt-36 sm:px-8">
      {state === "loading" && <p className="text-dim">Confirming your order…</p>}
      {state === "bad" && (<><h1 className="h-display text-[clamp(2.2rem,5vw,4rem)]">Hmm.</h1><p className="mt-4 text-dim">{msg}</p><Link href="/services#skill-pricing" className="btn btn-primary mt-8">Back to the skill</Link></>)}
      {state === "ok" && token && (
        <>
          <div className="eyebrow">Order confirmed</div>
          <h1 className="h-display mt-4 text-[clamp(2.4rem,5.4vw,4.6rem)]">You have AURA.</h1>
          {preview && <p className="mt-4 rounded-2xl border border-[rgb(255_210_138/0.4)] bg-[rgb(255_210_138/0.08)] p-4 text-[13px] text-[#ffd28a]">Test mode — no payment provider is connected to this deployment yet, so the order was recorded without charging. Set <code className="font-mono">STRIPE_SECRET_KEY</code> to take real {SKILL.priceLabel} payments.</p>}
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[["skill", "Skill folder", "Install into Claude / Codex / Cursor", true], ["single", "Single-file edition", "One .md for any chat", false], ["starter", "Starter engine", "Vite + React + three.js project", false]].map(([k, t, d, p]) => (
              <a key={k as string} href={dl(k as string)} className={`panel block !rounded-[20px] p-5 transition hover:-translate-y-1 ${p ? "!border-[rgb(92_255_196/0.5)]" : ""}`}><div className="text-aurora">↓</div><b className="mt-3 block font-display text-[18px]">{t}</b><p className="mt-1 text-[13px] text-dim">{d}</p></a>
            ))}
          </div>
          <div className="mt-10 font-mono text-[11px] tracking-[0.2em] text-dim uppercase">After you download</div>
          <ol className="mt-4 space-y-2 text-[14px] text-dim">
            <li>1 · Unzip the skill. You get one folder: aura-3d-web.</li>
            <li>2 · Open that folder in your agent: Claude Code, Cursor, Codex, Gemini CLI, or any agent that can read files.</li>
            <li>3 · Paste the prompt. Your agent adds the skill to its skills directory.</li>
          </ol>
          <div className="mt-5"><SkillPrompt /></div>
          <p className="mt-8 text-[13px] text-dim">Bookmark this page — the link stays valid. Want it built for you? <Link href="/services#build" className="text-aurora hover:underline">Request a site</Link>.</p>
        </>
      )}
    </main>
  );
}
