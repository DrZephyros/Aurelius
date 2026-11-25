"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";

export type DockItem = { label: string; icon: ReactNode; href?: string; onClick?: () => void };

export type FloatingDockProps = {
  items: DockItem[];
  /** Base icon size in px. */
  size?: number;
  /** Peak magnification. */
  magnify?: number;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-fd{display:inline-flex;align-items:flex-end;gap:10px;padding:10px 14px;border-radius:22px;border:1px solid var(--au-border,rgb(255 255 255/.12));background:rgb(255 255 255/.06);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.au-fd-i{position:relative;display:grid;place-items:center;border-radius:14px;background:rgb(255 255 255/.08);border:1px solid rgb(255 255 255/.1);color:inherit;text-decoration:none;cursor:pointer;transform-origin:bottom center;will-change:transform}
.au-fd-i::after{content:attr(data-label);position:absolute;bottom:calc(100% + 10px);left:50%;transform:translate(-50%,4px);white-space:nowrap;font-size:12px;padding:4px 9px;border-radius:8px;background:rgb(10 14 23/.95);border:1px solid rgb(255 255 255/.12);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s}
.au-fd-i:hover::after,.au-fd-i:focus-visible::after{opacity:1;transform:translate(-50%,0)}`;

/** macOS-style dock: icons magnify smoothly as the pointer glides across. */
export function FloatingDock({ items, size = 46, magnify = 1.7, className, style }: FloatingDockProps) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const apply = (x: number | null) => {
    refs.current.forEach((el) => {
      if (!el) return;
      let s = 1;
      if (x !== null) { const r = el.getBoundingClientRect(); const nav = el.parentElement!, k = nav.getBoundingClientRect().width / nav.offsetWidth || 1; /* CSS-scaled previews */ const d = Math.abs(x - (r.left + r.width / 2)) / k; s = 1 + (magnify - 1) * Math.exp(-((d / (size * 1.6)) ** 2)); }
      el.style.transform = `scale(${s})`;
      el.style.margin = `0 ${(s - 1) * size * 0.28}px`;
    });
  };
  return (
    <nav
      aria-label="Dock"
      className={`au-fd ${className ?? ""}`}
      style={style}
      onPointerMove={(e) => e.pointerType !== "touch" && apply(e.clientX)}
      onPointerLeave={() => apply(null)}
    >
      <style>{CSS}</style>
      {items.map((it, i) => {
        const p = { ref: (el: HTMLElement | null) => { refs.current[i] = el; }, className: "au-fd-i", "data-label": it.label, "aria-label": it.label, style: { width: size, height: size, transition: "transform .18s cubic-bezier(.2,.8,.2,1), margin .18s cubic-bezier(.2,.8,.2,1)" } as CSSProperties };
        return it.href ? <a key={it.label} href={it.href} {...p}>{it.icon}</a> : <button key={it.label} type="button" onClick={it.onClick} {...p}>{it.icon}</button>;
      })}
    </nav>
  );
}
