"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export type Tab = { id: string; label: ReactNode; content?: ReactNode };

export type SlidingTabsProps = {
  tabs: Tab[];
  /** Controlled value. */
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-st{display:inline-flex;position:relative;padding:4px;border-radius:999px;border:1px solid var(--au-border,rgb(255 255 255/.12));background:rgb(255 255 255/.04)}
.au-st-p{position:absolute;top:4px;bottom:4px;left:0;border-radius:999px;background:var(--au-accent,#5cffc4);transition:transform .45s cubic-bezier(.16,1,.3,1),width .45s cubic-bezier(.16,1,.3,1)}
.au-st button{position:relative;z-index:1;padding:8px 18px;border-radius:999px;font-size:14px;font-weight:500;color:inherit;opacity:.65;transition:color .25s,opacity .25s;cursor:pointer}
.au-st button[aria-selected=true]{color:var(--au-bg,#021510);opacity:1}
.au-stp{animation:au-stp .45s cubic-bezier(.16,1,.3,1)}@keyframes au-stp{from{opacity:0;transform:translateY(8px)}}`;

/** Tabs with a pill that slides between options. Arrow keys / Home / End supported. Optional panels via `content`. */
export function SlidingTabs({ tabs, value, defaultValue, onChange, className, style }: SlidingTabsProps) {
  const [inner, setInner] = useState(defaultValue ?? tabs[0]?.id);
  const cur = value ?? inner;
  const btn = useRef<Record<string, HTMLButtonElement | null>>({});
  const [pill, setPill] = useState({ x: 0, w: 0 });

  useEffect(() => {
    const measure = () => { const b = btn.current[cur]; if (b) setPill({ x: b.offsetLeft, w: b.offsetWidth }); };
    measure();
    document.fonts?.ready.then(measure);
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, [cur, tabs]);

  const pick = (id: string) => { setInner(id); onChange?.(id); btn.current[id]?.focus(); };
  const onKey = (e: React.KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.id === cur);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    pick(tabs[(next + tabs.length) % tabs.length].id);
  };
  const panel = tabs.find((t) => t.id === cur)?.content;

  return (
    <div className={className} style={style}>
      <style>{CSS}</style>
      <div className="au-st" role="tablist" onKeyDown={onKey}>
        <span className="au-st-p" style={{ width: pill.w, transform: `translateX(${pill.x}px)` }} aria-hidden />
        {tabs.map((t) => (
          <button key={t.id} ref={(el) => { btn.current[t.id] = el; }} role="tab" id={`au-tab-${t.id}`} aria-selected={cur === t.id} aria-controls={`au-panel-${t.id}`} tabIndex={cur === t.id ? 0 : -1} onClick={() => pick(t.id)}>{t.label}</button>
        ))}
      </div>
      {panel !== undefined && <div key={cur} id={`au-panel-${cur}`} role="tabpanel" aria-labelledby={`au-tab-${cur}`} className="au-stp" style={{ marginTop: 20 }}>{panel}</div>}
    </div>
  );
}
