"use client";

import type { CSSProperties, ReactNode } from "react";

export type ComparisonRow = { title: string; before: ReactNode; after: ReactNode };

export type ComparisonCardsProps = {
  eyebrow?: string;
  title?: ReactNode;
  rows: ComparisonRow[];
  /** Labels for the two lines in each card. */
  labels?: [string, string];
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-cc{color:inherit}
.au-cc-eb{display:flex;align-items:center;gap:14px;font:600 11px/1 ui-monospace,monospace;letter-spacing:.22em;text-transform:uppercase;color:var(--au-accent,#5cffc4)}
.au-cc-eb::before{content:"";width:36px;height:1px;background:currentColor}
.au-cc h2{margin:18px 0 0;font-size:clamp(2.2rem,5vw,3.6rem);line-height:1.02;letter-spacing:-.045em;font-weight:650}
.au-cc-g{margin-top:40px;display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
.au-cc-c{position:relative;border-radius:26px;padding:26px;border:1px solid rgb(255 255 255/.12);background:#0b0e16}
.au-cc-n{font:500 11px/1 ui-monospace,monospace;letter-spacing:.18em;opacity:.45}
.au-cc-c h3{margin:26px 0 22px;font-size:1.6rem;letter-spacing:-.03em;font-weight:600}
.au-cc-l{border-radius:16px;padding:16px 18px;border:1px solid rgb(255 255 255/.08);background:rgb(255 255 255/.03)}
.au-cc-l+.au-cc-l{margin-top:12px}
.au-cc-k{font:600 10.5px/1 ui-monospace,monospace;letter-spacing:.18em;text-transform:uppercase;opacity:.5}
.au-cc-l p{margin:10px 0 0;font-size:15.5px;line-height:1.45;opacity:.6}
.au-cc-after{border-color:rgb(92 255 196/.35)!important;background:rgb(92 255 196/.07)!important}
.au-cc-after .au-cc-k{color:var(--au-accent,#5cffc4);opacity:1}
.au-cc-after p{opacity:.95;color:inherit;font-weight:500;margin-top:10px}`;

/** Side-by-side comparison: each card sets a generic option against a better one, in two plain lines. */
export function ComparisonCards({ eyebrow, title, rows, labels = ["Generic", "Better"], className, style }: ComparisonCardsProps) {
  return (
    <section className={`au-cc ${className ?? ""}`} style={style}>
      <style>{CSS}</style>
      {eyebrow && <div className="au-cc-eb">{eyebrow}</div>}
      {title && <h2>{title}</h2>}
      <div className="au-cc-g">
        {rows.map((r, i) => (
          <article key={r.title} className="au-cc-c">
            <div className="au-cc-n">{String(i + 1).padStart(2, "0")}</div>
            <h3>{r.title}</h3>
            <div className="au-cc-l">
              <div className="au-cc-k">{labels[0]}</div>
              <p>{r.before}</p>
            </div>
            <div className="au-cc-l au-cc-after">
              <div className="au-cc-k">{labels[1]}</div>
              <p>{r.after}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
