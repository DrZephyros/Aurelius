"use client";

import { useId, useState, type CSSProperties } from "react";

export type PasswordFieldProps = {
  value: string;
  onChange: (value: string, score: number) => void;
  label?: string;
  /** Show the requirement checklist. */
  checklist?: boolean;
  name?: string;
  autoComplete?: "new-password" | "current-password";
  className?: string;
  style?: CSSProperties;
};

/** 0–4 password score (length, case, digits, symbols). Exported for server-side-style checks in your own code. */
export function scorePassword(p: string): number {
  const checks = [p.length >= 8, /[a-z]/.test(p) && /[A-Z]/.test(p), /\d/.test(p), /[^A-Za-z0-9]/.test(p)];
  return p ? Math.max(1, checks.filter(Boolean).length) - (p.length < 8 ? 1 : 0) : 0;
}

const LEVELS = [
  ["", "transparent"],
  ["Weak", "#ff6b81"],
  ["Fair", "#ffb454"],
  ["Good", "#9be564"],
  ["Strong", "#5cffc4"],
] as const;

const CSS = `.au-pw{position:relative}
.au-pw input{width:100%;height:52px;padding:0 64px 0 16px;border-radius:14px;border:1px solid var(--au-border,rgb(255 255 255/.16));background:rgb(255 255 255/.04);color:inherit;font:inherit;outline:none;transition:border-color .2s,box-shadow .2s}
.au-pw input:focus{border-color:var(--au-accent,#5cffc4);box-shadow:0 0 0 4px color-mix(in srgb,var(--au-accent,#5cffc4) 18%,transparent)}
.au-pw-t{position:absolute;right:8px;top:8px;height:36px;padding:0 12px;border-radius:10px;font-size:12px;opacity:.7;cursor:pointer}.au-pw-t:hover{opacity:1;background:rgb(255 255 255/.08)}
.au-pw-bars{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:10px}.au-pw-bars i{height:4px;border-radius:4px;background:rgb(255 255 255/.12);transition:background .3s}
.au-pw ul{list-style:none;padding:0;margin:10px 0 0;display:grid;gap:4px;font-size:12.5px}.au-pw li{opacity:.5;transition:opacity .2s,color .2s}.au-pw li.ok{opacity:1;color:var(--au-accent,#5cffc4)}`;

/** Password input with show/hide, a 4-segment strength meter and a live requirements checklist. */
export function PasswordField({ value, onChange, label = "Password", checklist = true, name, autoComplete = "new-password", className, style }: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const id = useId();
  const score = scorePassword(value);
  const [word, color] = LEVELS[score];
  const rules: [string, boolean][] = [["8+ characters", value.length >= 8], ["Upper & lower case", /[a-z]/.test(value) && /[A-Z]/.test(value)], ["A number", /\d/.test(value)], ["A symbol", /[^A-Za-z0-9]/.test(value)]];
  return (
    <div className={`au-pw ${className ?? ""}`} style={style}>
      <style>{CSS}</style>
      <label htmlFor={id} style={{ display: "block", fontSize: 13, opacity: 0.7, marginBottom: 6 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input id={id} name={name} type={show ? "text" : "password"} value={value} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value, scorePassword(e.target.value))} aria-describedby={`${id}-s`} />
        <button type="button" className="au-pw-t" onClick={() => setShow((s) => !s)} aria-pressed={show}>{show ? "Hide" : "Show"}</button>
      </div>
      <div className="au-pw-bars" aria-hidden>{[1, 2, 3, 4].map((n) => <i key={n} style={{ background: score >= n ? color : undefined }} />)}</div>
      <div id={`${id}-s`} aria-live="polite" style={{ fontSize: 12, marginTop: 6, minHeight: 16, color }}>{word}</div>
      {checklist && <ul>{rules.map(([t, ok]) => <li key={t} className={ok ? "ok" : ""}>{ok ? "✓" : "○"} {t}</li>)}</ul>}
    </div>
  );
}
