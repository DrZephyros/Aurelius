import { useState } from "react";
import { saveRequest } from "@/lib/stats";

export function RequestForm() {
  const [idea, setIdea] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = idea.trim();
    if (clean.length < 8 || clean.length > 600) {
      setState("error");
      setMsg("Tell us a bit more (8–600 characters).");
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState("error");
      setMsg("That email doesn't look right.");
      return;
    }
    saveRequest(clean, email.trim() || null);
    setState("done");
    setIdea("");
    setEmail("");
  }

  if (state === "done") {
    return (
      <div className="panel grid place-items-center p-10 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-aurora text-[#021510]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5 9-10" /></svg>
        </div>
        <p className="mt-5 font-display text-2xl font-semibold tracking-tight">Got it — thank you.</p>
        <p className="mt-2 text-sm text-dim">Requests decide what gets built next.</p>
        <button className="btn btn-ghost btn-sm mt-6" onClick={() => setState("idle")}>Send another</button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="panel space-y-4 p-6 sm:p-8">
      <label className="block">
        <span className="mb-2 block font-mono text-[11px] tracking-[0.16em] text-dim uppercase">The template you wish existed</span>
        <textarea
          required
          minLength={8}
          maxLength={600}
          rows={4}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="e.g. A liquid-glass fintech landing page with a 3D credit card that follows the cursor…"
          className="w-full resize-none rounded-2xl border border-line bg-black/30 px-4 py-3 text-[15px] outline-none transition placeholder:text-white/25 focus:border-aurora/60"
        />
      </label>
      <label className="block">
        <span className="mb-2 block font-mono text-[11px] tracking-[0.16em] text-dim uppercase">Email (optional — only to tell you when it ships)</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@studio.com"
          className="h-12 w-full rounded-2xl border border-line bg-black/30 px-4 text-[15px] outline-none transition placeholder:text-white/25 focus:border-aurora/60"
        />
      </label>
      <div className="flex items-center justify-between gap-4">
        <p className={`text-sm ${state === "error" ? "text-[#ff8a7a]" : "text-dim"}`}>{state === "error" ? msg : `${idea.length}/600`}</p>
        <button disabled={state === "sending"} className="btn btn-primary disabled:opacity-60">
          {state === "sending" ? "Sending…" : "Request template"}
        </button>
      </div>
    </form>
  );
}
