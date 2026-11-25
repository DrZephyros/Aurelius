"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, navigate } from "@/lib/router";
import type { Bundle, Plan } from "./data";

/* The four functional pages every bundle ships: pricing, sign-in, reserve/order and account.
   One implementation, themed entirely by the CSS variables on .bd and the copy in data.ts.
   State lives in localStorage under bundle:<slug>:* so the flow really works end to end. */

type Booking = { code: string; planId: string; planName: string; date: string; qty: number; party: number; extras: string[]; total: number; at: number };
type User = { name: string; email: string };

const K = (slug: string, k: string) => `bundle:${slug}:${k}`;
function read<T>(key: string, d: T): T {
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : d; } catch { return d; }
}
const write = (key: string, v: unknown) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* private mode */ } };
export const money = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

function useTween(v: number) {
  const [x, setX] = useState(v);
  const cur = useRef(v);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      cur.current += (v - cur.current) * 0.18;
      if (Math.abs(v - cur.current) < 0.5) cur.current = v;
      setX(cur.current);
      if (cur.current !== v) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [v]);
  return x;
}

function useToast() {
  const [msg, setMsg] = useState("");
  const t = useRef(0);
  const show = (m: string) => { setMsg(m); clearTimeout(t.current); t.current = window.setTimeout(() => setMsg(""), 2600); };
  return { show, node: <div className={`bd-toast ${msg ? "on" : ""}`} role="status">{msg}</div> };
}

const Head = ({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) => (
  <header style={{ maxWidth: 760 }}>
    <div className="bd-eyebrow">{eyebrow}</div>
    <h1 className="bd-h">{title}</h1>
    {lead && <p className="bd-lead" style={{ marginTop: 22, fontSize: 17, maxWidth: 560 }}>{lead}</p>}
  </header>
);

/* ───────────────────────── pricing ───────────────────────── */
function PlanCard({ b, plan, mode, onPick }: { b: Bundle; plan: Plan; mode: 0 | 1; onPick: () => void }) {
  const price = useTween(plan.price[mode]);
  return (
    <article className={`bd-card bd-plan ${plan.hot ? "hot" : ""}`}>
      {plan.hot && <span className="bd-badge">Most chosen</span>}
      <h3 className="bd-h" style={{ fontSize: "1.9rem" }}>{plan.name}</h3>
      <p className="bd-lead" style={{ marginTop: 10, fontSize: 14.5, minHeight: 46 }}>{plan.blurb}</p>
      <div className="bd-price">{money(price)}<small>{b.pricing.unit[mode]}</small></div>
      <ul className="bd-feat">{plan.features.map((f) => <li key={f}>{f}</li>)}</ul>
      <button type="button" className={`bd-btn ${plan.hot ? "bd-btn-primary" : "bd-btn-ghost"}`} style={{ marginTop: "auto" }} onClick={onPick}>Choose {plan.name} →</button>
    </article>
  );
}

export function PricingPage({ b }: { b: Bundle }) {
  const [mode, setMode] = useState<0 | 1>(0);
  const p = b.pricing;
  return (
    <div className="bd-page">
      <Head eyebrow={p.eyebrow} title={p.title} lead={p.lead} />
      <div style={{ marginTop: 34, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
        <div className="bd-toggle" data-i={mode} role="group" aria-label="Billing">
          <i />
          {p.toggle.map((t, i) => <button key={t} type="button" className={mode === i ? "on" : ""} aria-pressed={mode === i} onClick={() => setMode(i as 0 | 1)}>{t}</button>)}
        </div>
        <span className="bd-lead" style={{ fontSize: 13.5 }}>{p.note}</span>
      </div>
      <div className="bd-plans">
        {p.plans.map((pl) => (
          <PlanCard key={pl.id} b={b} plan={pl} mode={mode} onPick={() => { sessionStorage.setItem(K(b.slug, "plan"), pl.id); navigate(`/bundles/${b.slug}/reserve`); }} />
        ))}
      </div>
      <section className="bd-faq" aria-label="Questions">
        <h2 className="bd-h" style={{ fontSize: "2rem", marginBottom: 10 }}>Questions</h2>
        {p.faq.map(([q, a]) => <details key={q} className="bd-card"><summary>{q}</summary><p>{a}</p></details>)}
      </section>
    </div>
  );
}

/* ───────────────────────── sign in / up ───────────────────────── */
export function SignInPage({ b }: { b: Bundle }) {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [f, setF] = useState({ name: "", email: "", pw: "" });
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [caps, setCaps] = useState(false);
  const err = {
    name: mode === "up" && f.name.trim().length < 2 ? "Tell us what to call you." : "",
    email: !isEmail(f.email) ? "Enter a valid email address." : "",
    pw: f.pw.length < 8 ? "At least 8 characters." : "",
  };
  const bad = Object.values(err).some(Boolean);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, pw: true });
    if (bad) return;
    setBusy(true);
    setTimeout(() => {
      const name = f.name.trim() || f.email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      write(K(b.slug, "user"), { name, email: f.email } satisfies User);
      navigate(`/bundles/${b.slug}/account`);
    }, 900);
  };
  const field = (id: "name" | "email" | "pw", label: string, input: ReactNode) => (
    <div>
      <label className="bd-label" htmlFor={`f-${id}`}>{label}</label>
      {input}
      <div className="bd-err" role="alert">{touched[id] ? err[id] : ""}</div>
    </div>
  );
  const common = (id: "name" | "email" | "pw") => ({ id: `f-${id}`, className: "bd-input", "aria-invalid": touched[id] && !!err[id], onBlur: () => setTouched((t) => ({ ...t, [id]: true })) });
  return (
    <div className="bd-page">
      <div className="bd-split">
        <div>
          <div className="bd-eyebrow">{b.nav.signin}</div>
          <h1 className="bd-h" style={{ marginBottom: 14 }}>{b.signin.title}</h1>
          <p className="bd-lead" style={{ maxWidth: 440, fontSize: 16.5 }}>{b.signin.lead}</p>
          <form className="bd-card bd-form" style={{ marginTop: 30, maxWidth: 480 }} onSubmit={submit} noValidate>
            <div className="bd-tabs" role="tablist">
              <button type="button" role="tab" aria-selected={mode === "in"} className={mode === "in" ? "on" : ""} onClick={() => setMode("in")}>Sign in</button>
              <button type="button" role="tab" aria-selected={mode === "up"} className={mode === "up" ? "on" : ""} onClick={() => setMode("up")}>Create account</button>
            </div>
            {mode === "up" && field("name", "Name", <input {...common("name")} autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />)}
            {field("email", "Email", <input {...common("email")} type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />)}
            {field("pw", "Password", (
              <div className="bd-pw">
                <input {...common("pw")} type={show ? "text" : "password"} autoComplete={mode === "in" ? "current-password" : "new-password"} value={f.pw}
                  onKeyUp={(e) => setCaps(e.getModifierState("CapsLock"))} onChange={(e) => setF({ ...f, pw: e.target.value })} />
                <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>{show ? "Hide" : "Show"}</button>
              </div>
            ))}
            {caps && <div className="bd-err" style={{ marginTop: -10 }}>Caps Lock is on.</div>}
            <button type="submit" className="bd-btn bd-btn-primary" disabled={busy}>{busy ? <><span className="bd-spin" /> Opening…</> : mode === "in" ? b.signin.cta : "Create account"}</button>
            <p className="bd-lead" style={{ fontSize: 12.5, textAlign: "center" }}>Demo only — nothing leaves your browser. Any valid email and 8+ character password works.</p>
          </form>
        </div>
        <figure className="bd-quote" style={{ margin: 0 }}>
          <div className="bd-eyebrow" style={{ marginBottom: 26 }}>In their words</div>
          <blockquote>“{b.signin.quote[0]}”</blockquote>
          <cite>{b.signin.quote[1]}</cite>
        </figure>
      </div>
    </div>
  );
}

/* ───────────────────────── reserve / order ───────────────────────── */
const rateFor = (b: Bundle, plan: Plan, qty: number, party: number) =>
  (b.slug === "yoru" && qty >= 7) || (b.slug === "altai" && party >= 4) ? plan.price[1] : plan.price[0];

function Stepper({ value, min, max, onChange, label }: { value: number; min: number; max: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="bd-step" role="group" aria-label={label}>
      <button type="button" aria-label={`Fewer ${label}`} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <output>{value}</output>
      <button type="button" aria-label={`More ${label}`} onClick={() => onChange(Math.min(max, value + 1))}>+</button>
    </div>
  );
}

export function ReservePage({ b }: { b: Bundle }) {
  const cfg = b.reserve, plans = b.pricing.plans;
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const today = iso(new Date());
  const [step, setStep] = useState(0);
  const [planId, setPlanId] = useState(() => sessionStorage.getItem(K(b.slug, "plan")) ?? plans.find((p) => p.hot)?.id ?? plans[0].id);
  const [date, setDate] = useState(() => iso(new Date(Date.now() + 14 * 864e5)));
  const [qty, setQty] = useState(1);
  const [party, setParty] = useState(cfg.partyLabel ? 2 : 1);
  const [xs, setXs] = useState<string[]>([]);
  const [c, setC] = useState({ name: read<User | null>(K(b.slug, "user"), null)?.name ?? "", email: read<User | null>(K(b.slug, "user"), null)?.email ?? "", note: "" });
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);
  const toast = useToast();

  const plan = plans.find((p) => p.id === planId) ?? plans[0];
  const rate = rateFor(b, plan, qty, party);
  const mult = cfg.mult === "qty" ? qty : cfg.mult === "party" ? party : 1;
  const xm = cfg.extraMult === "qty" ? qty : cfg.extraMult === "party" ? party : 1;
  const xsTotal = xs.reduce((s, id) => s + (cfg.extras.find((x) => x.id === id)?.price ?? 0), 0) * xm;
  const total = rate * mult + xsTotal;
  const shown = useTween(total);
  const dateOk = date >= today;
  const cErr = { name: c.name.trim().length < 2, email: !isEmail(c.email) };

  const next = () => {
    if (step === 1 && !dateOk) { toast.show("Pick a date in the future."); return; }
    if (step === 2) {
      setTouched(true);
      if (cErr.name || cErr.email) return;
      const code = b.slug.slice(0, 3).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      const bk: Booking = { code, planId: plan.id, planName: plan.name, date, qty, party, extras: xs, total, at: Date.now() };
      write(K(b.slug, "bookings"), [bk, ...read<Booking[]>(K(b.slug, "bookings"), [])]);
      sessionStorage.removeItem(K(b.slug, "plan"));
      setDone(bk);
      return;
    }
    setStep(step + 1);
  };

  if (done) {
    return (
      <div className="bd-page">
        <div className="bd-card bd-done" style={{ maxWidth: 640, margin: "0 auto" }}>
          <svg className="bd-ring" viewBox="0 0 84 84"><circle cx="42" cy="42" r="36" /><path d="M27 43l11 11 20-23" /></svg>
          <h1 className="bd-h" style={{ fontSize: "clamp(2.2rem,5vw,3.4rem)" }}>{cfg.confirm}</h1>
          <p className="bd-lead" style={{ marginTop: 14 }}>{done.planName} · {new Date(done.date + "T12:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {money(done.total)}</p>
          <div className="code">{done.code}</div>
          <p className="bd-lead" style={{ fontSize: 13 }}>A confirmation was “sent” to {c.email}.</p>
          <div style={{ marginTop: 28, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="bd-btn bd-btn-primary" onClick={() => navigate(`/bundles/${b.slug}/account`)}>View in {b.nav.account} →</button>
            <button className="bd-btn bd-btn-ghost" onClick={() => { setDone(null); setStep(0); setXs([]); }}>Make another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bd-page">
      <Head eyebrow={`${b.nav.reserve} · step ${step + 1} of 3`} title={cfg.title} lead={cfg.lead} />
      <div className="bd-steps" aria-hidden>{[0, 1, 2].map((i) => <div key={i} className={i <= step ? "on" : ""} />)}</div>
      <div className="bd-res">
        <div>
          {step === 0 && (
            <div style={{ display: "grid", gap: 12 }}>
              {plans.map((p) => (
                <button key={p.id} type="button" className="bd-card bd-opt" aria-pressed={p.id === planId} onClick={() => setPlanId(p.id)}>
                  <div><b>{p.name}</b><span>{p.blurb}</span></div>
                  <em>{money(p.price[0])}<small style={{ opacity: 0.6 }}> {b.pricing.unit[0]}</small></em>
                </button>
              ))}
            </div>
          )}
          {step === 1 && (
            <div className="bd-card" style={{ padding: 28, display: "grid", gap: 24 }}>
              <div className="bd-row">
                <div>
                  <label className="bd-label" htmlFor="r-date">{cfg.dateLabel}</label>
                  <input id="r-date" className="bd-input" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={!dateOk} />
                </div>
                {cfg.qtyLabel && <div><span className="bd-label">{cfg.qtyLabel}</span><Stepper label={cfg.qtyLabel} value={qty} min={1} max={cfg.qtyMax ?? 10} onChange={setQty} /></div>}
                {cfg.partyLabel && <div><span className="bd-label">{cfg.partyLabel}</span><Stepper label={cfg.partyLabel} value={party} min={1} max={cfg.partyMax ?? 6} onChange={setParty} /></div>}
              </div>
              <div>
                <span className="bd-label">Add-ons</span>
                <div style={{ display: "grid", gap: 8 }}>
                  {cfg.extras.map((x) => (
                    <button key={x.id} type="button" className="bd-xt" aria-pressed={xs.includes(x.id)} onClick={() => setXs((s) => (s.includes(x.id) ? s.filter((i) => i !== x.id) : [...s, x.id]))}>
                      <span>{xs.includes(x.id) ? "✓ " : "+ "}{x.label}</span><span>{x.price ? "+" + money(x.price) : "free"}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <form className="bd-card bd-form" noValidate onSubmit={(e) => { e.preventDefault(); next(); }}>
              <div>
                <label className="bd-label" htmlFor="c-name">Full name</label>
                <input id="c-name" className="bd-input" autoComplete="name" value={c.name} aria-invalid={touched && cErr.name} onChange={(e) => setC({ ...c, name: e.target.value })} />
                <div className="bd-err">{touched && cErr.name ? "Please enter your name." : ""}</div>
              </div>
              <div>
                <label className="bd-label" htmlFor="c-mail">Email</label>
                <input id="c-mail" className="bd-input" type="email" autoComplete="email" value={c.email} aria-invalid={touched && cErr.email} onChange={(e) => setC({ ...c, email: e.target.value })} />
                <div className="bd-err">{touched && cErr.email ? "Enter a valid email address." : ""}</div>
              </div>
              <div>
                <label className="bd-label" htmlFor="c-note">Anything we should know? <span style={{ opacity: 0.5 }}>(optional)</span></label>
                <textarea id="c-note" className="bd-input" style={{ height: 110, padding: 14, resize: "vertical" }} value={c.note} onChange={(e) => setC({ ...c, note: e.target.value })} />
              </div>
            </form>
          )}
          <div style={{ marginTop: 22, display: "flex", justifyContent: "space-between", gap: 12 }}>
            <button type="button" className="bd-btn bd-btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>← Back</button>
            <button type="button" className="bd-btn bd-btn-primary" onClick={next}>{step === 2 ? "Confirm" : "Continue →"}</button>
          </div>
        </div>
        <aside className="bd-card bd-sum" aria-label="Summary">
          <div className="bd-eyebrow">Summary</div>
          <dl>
            <div><dt>{plan.name}</dt><dd>{money(rate)} {cfg.unit === "night" ? "/ night" : `/ ${cfg.unit}`}</dd></div>
            <div><dt>{cfg.dateLabel}</dt><dd>{new Date(date + "T12:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</dd></div>
            {cfg.qtyLabel && <div><dt>{cfg.qtyLabel}</dt><dd>{qty}</dd></div>}
            {cfg.partyLabel && <div><dt>{cfg.partyLabel}</dt><dd>{party}</dd></div>}
            {xs.length > 0 && <div><dt>Add-ons</dt><dd>{money(xsTotal)}</dd></div>}
            {rate !== plan.price[0] && <div><dt>Rate</dt><dd style={{ color: "var(--b-accent2)" }}>Long-stay / group price</dd></div>}
          </dl>
          <div className="bd-total"><span className="bd-label" style={{ margin: 0 }}>Total</span><b>{money(shown)}</b></div>
        </aside>
      </div>
      {toast.node}
    </div>
  );
}

/* ───────────────────────── account ───────────────────────── */
export function AccountPage({ b }: { b: Bundle }) {
  const [user, setUser] = useState<User | null>(() => read<User | null>(K(b.slug, "user"), null));
  const [books, setBooks] = useState<Booking[]>(() => read<Booking[]>(K(b.slug, "bookings"), []));
  const a = b.account;
  const max = useMemo(() => Math.max(...a.chart), [a.chart]);
  const cancel = (code: string) => { const n = books.filter((x) => x.code !== code); setBooks(n); write(K(b.slug, "bookings"), n); };

  if (!user) {
    return (
      <div className="bd-page">
        <div className="bd-card bd-done" style={{ maxWidth: 560, margin: "0 auto" }}>
          <div className="bd-eyebrow">{b.nav.account}</div>
          <h1 className="bd-h" style={{ fontSize: "clamp(2rem,5vw,3rem)", marginTop: 16 }}>This page is for members.</h1>
          <p className="bd-lead" style={{ marginTop: 14 }}>Sign in to see your {b.nav.account.toLowerCase()}, bookings and history.</p>
          <Link href={`/bundles/${b.slug}/signin`} className="bd-btn bd-btn-primary" style={{ marginTop: 26 }}>{b.nav.signin} →</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="bd-page">
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: 20 }}>
        <Head eyebrow={`Welcome back, ${user.name.split(" ")[0]}`} title={a.title} />
        <div style={{ display: "flex", gap: 10 }}>
          <Link href={`/bundles/${b.slug}/reserve`} className="bd-btn bd-btn-primary bd-btn-sm">New {b.nav.reserve.toLowerCase()} →</Link>
          <button className="bd-btn bd-btn-ghost bd-btn-sm" onClick={() => { localStorage.removeItem(K(b.slug, "user")); setUser(null); }}>Sign out</button>
        </div>
      </div>
      <div className="bd-kpis">
        {a.stats.map(([l, v, d]) => <div key={l} className="bd-card bd-kpi"><small>{l}</small><b>{v}</b><span>{d}</span></div>)}
      </div>
      <div className="bd-grid2">
        <section className="bd-card" style={{ padding: 28 }}>
          <div className="bd-label" style={{ margin: 0 }}>{a.chartLabel}</div>
          <div className="bd-chart" role="img" aria-label={a.chartLabel}>
            {a.chart.map((v, i) => <div key={i} data-v={String(v)}><i style={{ height: `${Math.max(4, (v / max) * 100)}%`, animationDelay: `${i * 50}ms` }} /></div>)}
          </div>
        </section>
        <section className="bd-card" style={{ padding: 28 }}>
          <div className="bd-label" style={{ margin: 0 }}>{books.length ? "Your bookings" : a.listLabel}</div>
          <ul className="bd-list">
            {books.map((x) => (
              <li key={x.code}>
                <div><b>{x.planName} · {money(x.total)}</b><span>{x.code} · {new Date(x.date + "T12:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}><span className="bd-pill">Confirmed</span><button className="bd-x" onClick={() => cancel(x.code)}>Cancel</button></div>
              </li>
            ))}
            {a.items.map(([t, m, s]) => <li key={t}><div><b>{t}</b><span>{m}</span></div><span className="bd-pill">{s}</span></li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
