"use client";

import { useState, type CSSProperties, type FormEvent } from "react";

export type WaitlistFormProps = {
  /** POST endpoint receiving `{ email }` as JSON. A 2xx response means success. */
  endpoint?: string;
  buttonLabel?: string;
  placeholder?: string;
  successMessage?: string;
  /** Extra fields merged into the JSON body (e.g. { source: "hero" }). */
  extra?: Record<string, unknown>;
  /** Called after a successful submit. */
  onSuccess?: (email: string) => void;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-wl{display:flex;gap:8px;padding:6px;border-radius:999px;border:1px solid var(--au-border,rgb(255 255 255/.16));background:rgb(255 255 255/.04);transition:border-color .2s,box-shadow .2s}
.au-wl:focus-within{border-color:var(--au-accent,#5cffc4);box-shadow:0 0 0 4px color-mix(in srgb,var(--au-accent,#5cffc4) 16%,transparent)}
.au-wl input{flex:1;min-width:0;background:transparent;border:0;outline:0;color:inherit;font:inherit;padding:0 16px}
.au-wl button{height:44px;padding:0 22px;border-radius:999px;font-weight:600;background:var(--au-accent,#5cffc4);color:var(--au-bg,#021510);cursor:pointer;transition:transform .2s,opacity .2s;white-space:nowrap}
.au-wl button:hover:not(:disabled){transform:translateY(-1px)}.au-wl button:disabled{opacity:.6;cursor:wait}
.au-wl-ok{display:flex;align-items:center;gap:10px;padding:14px 20px;border-radius:999px;border:1px solid color-mix(in srgb,var(--au-accent,#5cffc4) 45%,transparent);background:color-mix(in srgb,var(--au-accent,#5cffc4) 10%,transparent);animation:au-wlp .5s cubic-bezier(.16,1,.3,1)}
@keyframes au-wlp{from{opacity:0;transform:scale(.96)}}`;

/** Email capture with validation, loading, success and error states, honeypot spam trap and a JSON POST. */
export function WaitlistForm({ endpoint = "/api/waitlist", buttonLabel = "Join the waitlist", placeholder = "you@company.com", successMessage = "You're on the list — we'll be in touch.", extra, onSuccess, className, style }: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trap = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value;
    if (trap) return setState("done"); // bots fill the hidden field: pretend it worked
    if (!/^\S+@\S+\.\S+$/.test(email)) { setState("error"); setMsg("Please enter a valid email."); return; }
    setState("loading");
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, ...extra }) });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Something went wrong.");
      setState("done"); onSuccess?.(email);
    } catch (err) {
      setState("error"); setMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (state === "done") return <div className={`au-wl-ok ${className ?? ""}`} style={style} role="status"><style>{CSS}</style><span style={{ color: "var(--au-accent,#5cffc4)" }}>✓</span>{successMessage}</div>;
  return (
    <form onSubmit={submit} noValidate className={className} style={style}>
      <style>{CSS}</style>
      <div className="au-wl">
        <input type="email" name="email" value={email} onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }} placeholder={placeholder} aria-label="Email address" autoComplete="email" aria-invalid={state === "error"} />
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
        <button type="submit" disabled={state === "loading"}>{state === "loading" ? "Joining…" : buttonLabel}</button>
      </div>
      <div role="alert" style={{ minHeight: 20, margin: "8px 18px 0", fontSize: 13, color: "#ff6b81" }}>{state === "error" ? msg : ""}</div>
    </form>
  );
}
