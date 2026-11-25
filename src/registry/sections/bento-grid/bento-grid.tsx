"use client";

import type { CSSProperties, ReactNode } from "react";

export type BentoItem = {
  title: string;
  description?: string;
  icon?: ReactNode;
  /** Decorative / illustrative content shown in the tile. */
  visual?: ReactNode;
  /** Tile size in grid cells. */
  size?: "sm" | "wide" | "tall" | "lg";
  href?: string;
};

export type BentoGridProps = { items: BentoItem[]; className?: string; style?: CSSProperties };

const CSS = `.au-bg{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:minmax(190px,auto);grid-auto-flow:dense;gap:14px}
.au-bg-t{position:relative;overflow:hidden;border-radius:24px;padding:24px;display:flex;flex-direction:column;justify-content:flex-end;gap:6px;border:1px solid var(--au-border,rgb(255 255 255/.1));background:linear-gradient(180deg,rgb(255 255 255/.05),rgb(255 255 255/.015));color:inherit;text-decoration:none;isolation:isolate;transition:transform .5s cubic-bezier(.16,1,.3,1),border-color .3s}
.au-bg-t:hover{transform:translateY(-3px);border-color:rgb(255 255 255/.22)}
.au-bg-t::before{content:"";position:absolute;inset:0;z-index:-1;opacity:0;transition:opacity .4s;background:radial-gradient(360px circle at var(--au-x,50%) var(--au-y,0%),color-mix(in srgb,var(--au-accent,#5cffc4) 16%,transparent),transparent 65%)}
.au-bg-t:hover::before{opacity:1}
.au-bg-w{grid-column:span 2}.au-bg-h{grid-row:span 2}.au-bg-l{grid-column:span 2;grid-row:span 2}
.au-bg-v{position:absolute;inset:0 0 auto 0;height:60%;display:grid;place-items:center;pointer-events:none;overflow:hidden;z-index:-1}
.au-bg-i{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:rgb(255 255 255/.08);margin-bottom:auto;font-size:18px}
.au-bg-t h3{font-size:18px;font-weight:600;letter-spacing:-.02em;margin:0}.au-bg-t p{margin:0;font-size:14px;line-height:1.5;opacity:.6;max-width:36ch}
@media(max-width:860px){.au-bg{grid-template-columns:repeat(2,1fr)}}@media(max-width:520px){.au-bg{grid-template-columns:1fr}.au-bg-w,.au-bg-l{grid-column:auto}}`;

/** An asymmetric feature grid whose tiles light up under the cursor. */
export function BentoGrid({ items, className, style }: BentoGridProps) {
  return (
    <div className={`au-bg ${className ?? ""}`} style={style}>
      <style>{CSS}</style>
      {items.map((it) => {
        const cls = `au-bg-t ${it.size === "wide" ? "au-bg-w" : it.size === "tall" ? "au-bg-h" : it.size === "lg" ? "au-bg-l" : ""}`;
        const body = (
          <>
            {it.visual && <div className="au-bg-v">{it.visual}</div>}
            {it.icon && <div className="au-bg-i">{it.icon}</div>}
            <h3>{it.title}</h3>
            {it.description && <p>{it.description}</p>}
          </>
        );
        const move = (e: React.PointerEvent<HTMLElement>) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--au-x", `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty("--au-y", `${e.clientY - r.top}px`);
        };
        return it.href ? <a key={it.title} href={it.href} className={cls} onPointerMove={move}>{body}</a> : <div key={it.title} className={cls} onPointerMove={move}>{body}</div>;
      })}
    </div>
  );
}
