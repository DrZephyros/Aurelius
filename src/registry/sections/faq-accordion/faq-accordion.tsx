"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";

export type FaqItem = { q: string; a: ReactNode };
export type FaqAccordionProps = {
  items: FaqItem[];
  /** Allow several items open at once. */
  multiple?: boolean;
  /** Index opened initially. */
  defaultOpen?: number;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-fq{border-top:1px solid var(--au-border,rgb(255 255 255/.12))}
.au-fq>div{border-bottom:1px solid var(--au-border,rgb(255 255 255/.12))}
.au-fq button{width:100%;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:22px 4px;text-align:left;font-size:17px;font-weight:550;letter-spacing:-.01em;cursor:pointer;color:inherit}
.au-fq-i{position:relative;width:14px;height:14px;flex-shrink:0}.au-fq-i::before,.au-fq-i::after{content:"";position:absolute;left:0;top:6px;width:14px;height:2px;background:currentColor;border-radius:2px;transition:transform .4s cubic-bezier(.16,1,.3,1)}.au-fq-i::after{transform:rotate(90deg)}
.au-fq button[aria-expanded=true] .au-fq-i::after{transform:rotate(0)}
.au-fq-p{display:grid;grid-template-rows:0fr;transition:grid-template-rows .5s cubic-bezier(.16,1,.3,1)}.au-fq-p.au-o{grid-template-rows:1fr}
.au-fq-p>div{overflow:hidden}.au-fq-p>div>div{padding:0 4px 22px;opacity:.65;line-height:1.65;font-size:15px;max-width:68ch}`;

/** Accessible accordion with smooth height animation (CSS grid trick — no measuring). */
export function FaqAccordion({ items, multiple = false, defaultOpen, className, style }: FaqAccordionProps) {
  const [open, setOpen] = useState<number[]>(defaultOpen === undefined ? [] : [defaultOpen]);
  const uid = useId();
  const toggle = (i: number) => setOpen((o) => (o.includes(i) ? o.filter((x) => x !== i) : multiple ? [...o, i] : [i]));
  return (
    <div className={`au-fq ${className ?? ""}`} style={style}>
      <style>{CSS}</style>
      {items.map((it, i) => (
        <div key={i}>
          <h3 style={{ margin: 0 }}>
            <button aria-expanded={open.includes(i)} aria-controls={`${uid}-${i}`} id={`${uid}-b${i}`} onClick={() => toggle(i)}>{it.q}<span className="au-fq-i" aria-hidden /></button>
          </h3>
          <div id={`${uid}-${i}`} role="region" aria-labelledby={`${uid}-b${i}`} className={`au-fq-p ${open.includes(i) ? "au-o" : ""}`}><div><div>{it.a}</div></div></div>
        </div>
      ))}
    </div>
  );
}
