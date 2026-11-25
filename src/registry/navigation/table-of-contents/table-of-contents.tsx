"use client";

import { useEffect, useState, type CSSProperties } from "react";

export type TableOfContentsProps = {
  /** CSS selector for the headings to list. */
  selector?: string;
  /** CSS selector of the container the headings live in. */
  root?: string;
  title?: string;
  /** Offset for sticky headers (px). */
  offset?: number;
  className?: string;
  style?: CSSProperties;
};

type H = { id: string; text: string; level: number };

const CSS = `.au-toc a{display:block;padding:5px 0 5px 14px;margin-left:-1px;border-left:2px solid transparent;font-size:13.5px;line-height:1.4;color:inherit;opacity:.55;text-decoration:none;transition:opacity .2s,border-color .2s,color .2s}
.au-toc a:hover{opacity:.9}.au-toc a[aria-current=true]{opacity:1;border-color:var(--au-accent,#5cffc4);color:var(--au-accent,#5cffc4)}`;

/** Scroll-spy table of contents built from the page's own headings. Ideal for docs and blog posts. */
export function TableOfContents({ selector = "h2, h3", root = "article", title = "On this page", offset = 96, className, style }: TableOfContentsProps) {
  const [hs, setHs] = useState<H[]>([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const scope = document.querySelector(root) ?? document;
    const els = [...scope.querySelectorAll<HTMLElement>(selector)];
    els.forEach((el) => { if (!el.id) el.id = (el.textContent ?? "").toLowerCase().trim().replace(/[^\w]+/g, "-").replace(/^-|-$/g, ""); });
    setHs(els.map((el) => ({ id: el.id, text: el.textContent ?? "", level: Number(el.tagName[1]) })));
    const on = () => {
      let cur = els[0]?.id ?? "";
      for (const el of els) if (el.getBoundingClientRect().top - offset - 8 <= 0) cur = el.id;
      setActive(cur);
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, [selector, root, offset]);

  if (!hs.length) return null;
  const base = Math.min(...hs.map((h) => h.level));
  return (
    <nav aria-label={title} className={`au-toc ${className ?? ""}`} style={style}>
      <style>{CSS}</style>
      <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.5, marginBottom: 10 }}>{title}</div>
      <div style={{ borderLeft: "1px solid var(--au-border,rgb(255 255 255/.12))" }}>
        {hs.map((h) => (
          <a key={h.id} href={`#${h.id}`} aria-current={active === h.id} style={{ paddingLeft: 14 + (h.level - base) * 14 }} onClick={(e) => { e.preventDefault(); const t = document.getElementById(h.id); if (t) { scrollTo({ top: t.getBoundingClientRect().top + scrollY - offset, behavior: "smooth" }); history.replaceState(null, "", `#${h.id}`); } }}>{h.text}</a>
        ))}
      </div>
    </nav>
  );
}
