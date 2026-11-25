"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type Command = { id: string; label: string; group?: string; hint?: string; keywords?: string; onSelect: () => void };

export type CommandPaletteProps = {
  commands: Command[];
  /** Hotkey letter used with ⌘ / Ctrl. */
  hotkey?: string;
  placeholder?: string;
  /** Controlled open state (optional). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const CSS = `.au-cp{position:fixed;inset:0;z-index:3000;display:flex;justify-content:center;align-items:flex-start;padding:14vh 16px 0;background:rgb(2 4 10/.55);backdrop-filter:blur(5px);animation:au-cpf .2s}
.au-cp-p{width:min(600px,100%);max-height:62vh;display:flex;flex-direction:column;border-radius:22px;background:#0c111d;color:#e9f1f5;border:1px solid rgb(255 255 255/.14);box-shadow:0 40px 100px -20px rgb(0 0 0/.8);overflow:hidden;animation:au-cpi .35s cubic-bezier(.16,1,.3,1)}
.au-cp-p input{height:58px;padding:0 22px;background:transparent;border:0;border-bottom:1px solid rgb(255 255 255/.1);outline:0;color:inherit;font:inherit;font-size:16px}
.au-cp-l{overflow:auto;padding:8px}.au-cp-g{padding:10px 14px 4px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.4}
.au-cp-i{display:flex;justify-content:space-between;gap:12px;padding:11px 14px;border-radius:12px;font-size:14.5px;cursor:pointer}.au-cp-i[aria-selected=true]{background:rgb(255 255 255/.08)}.au-cp-i small{opacity:.45}
@keyframes au-cpf{from{opacity:0}}@keyframes au-cpi{from{opacity:0;transform:translateY(-12px) scale(.98)}}`;

/** ⌘K / Ctrl+K command palette. Pass an array of commands; it handles search, grouping, arrows, Enter and Esc. */
export function CommandPalette({ commands, hotkey = "k", placeholder = "Type a command or search…", open: ctrl, onOpenChange }: CommandPaletteProps) {
  const [inner, setInner] = useState(false);
  const open = ctrl ?? inner;
  const setOpen = (v: boolean) => { setInner(v); onOpenChange?.(v); };
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === hotkey) { e.preventDefault(); setOpen(!open); }
      else if (e.key === "Escape" && open) setOpen(false);
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hotkey]);

  useEffect(() => { if (open) { setQ(""); setI(0); setTimeout(() => input.current?.focus(), 10); } }, [open]);

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return commands.filter((c) => { const hay = `${c.label} ${c.group ?? ""} ${c.keywords ?? ""}`.toLowerCase(); return words.every((w) => hay.includes(w)); });
  }, [q, commands]);

  if (!open) return null;
  const run = (c?: Command) => { if (!c) return; setOpen(false); c.onSelect(); };
  let last = "";
  return createPortal(
    <div className="au-cp" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <style>{CSS}</style>
      <div className="au-cp-p" role="dialog" aria-modal="true" aria-label="Command palette">
        <input ref={input} value={q} placeholder={placeholder} role="combobox" aria-expanded aria-controls="au-cp-list" aria-activedescendant={results[i] ? `au-cp-${results[i].id}` : undefined}
          onChange={(e) => { setQ(e.target.value); setI(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setI((x) => Math.min(results.length - 1, x + 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
            if (e.key === "Enter") run(results[i]);
          }} />
        <div className="au-cp-l" id="au-cp-list" role="listbox">
          {results.length === 0 && <div style={{ padding: 22, opacity: 0.5, fontSize: 14 }}>No results.</div>}
          {results.map((c, n) => {
            const head = c.group && c.group !== last ? <div key={"g" + c.group} className="au-cp-g">{c.group}</div> : null;
            last = c.group ?? last;
            return [head, <div key={c.id} id={`au-cp-${c.id}`} role="option" aria-selected={n === i} className="au-cp-i" onMouseMove={() => setI(n)} onClick={() => run(c)}><span>{c.label}</span>{c.hint && <small>{c.hint}</small>}</div>];
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
