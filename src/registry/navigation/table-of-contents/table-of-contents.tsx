"use client";

import { useEffect, useState, type CSSProperties } from "react";

export type TableOfContentsProps = {
  /** CSS selector for the headings to list. */
  selector?: string;
  /** CSS selector of the container the headings live in. */
  root?: string;
  title?: string;
  /** Offset for sticky headers (px) when the page itself scrolls. */
  offset?: number;
  /** Also write the clicked heading's id into the URL hash (off by default so it never fights a hash router). */
  updateHash?: boolean;
  className?: string;
  style?: CSSProperties;
};

type H = { id: string; text: string; level: number };

const CSS = `.au-toc a{display:block;padding:5px 0 5px 14px;margin-left:-1px;border-left:2px solid transparent;font-size:13.5px;line-height:1.4;color:inherit;opacity:.55;text-decoration:none;transition:opacity .2s,border-color .2s,color .2s}
.au-toc a:hover{opacity:.9}.au-toc a[aria-current=true]{opacity:1;border-color:var(--au-accent,#5cffc4);color:var(--au-accent,#5cffc4)}`;

/** Nearest ancestor that really scrolls vertically (null → the page). The headings may live in an inner scroll area. */
function scrollerOf(el: HTMLElement | undefined): HTMLElement | null {
  for (let p = el?.parentElement ?? null; p; p = p.parentElement) {
    if (/(auto|scroll|overlay)/.test(getComputedStyle(p).overflowY) && p.scrollHeight > p.clientHeight + 1) return p;
  }
  return null;
}

/** Scroll-spy table of contents built from the page's own headings. Clicking an entry scrolls — the page or an inner scroll area, whichever holds the headings. */
export function TableOfContents({ selector = "h2, h3", root = "article", title = "On this page", offset = 96, updateHash = false, className, style }: TableOfContentsProps) {
  const [hs, setHs] = useState<H[]>([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const scope = document.querySelector(root) ?? document;
    const els = [...scope.querySelectorAll<HTMLElement>(selector)];
    const used = new Set<string>();
    els.forEach((el, i) => {
      let id = el.id || (el.textContent ?? "").toLowerCase().trim().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") || `section-${i}`;
      while (used.has(id)) id += "-" + i;
      used.add(id);
      el.id = id;
    });
    setHs(els.map((el) => ({ id: el.id, text: el.textContent ?? "", level: Number(el.tagName[1]) })));

    const box = scrollerOf(els[0]);
    const top = () => (box ? box.getBoundingClientRect().top + 12 : offset + 8);
    const on = () => {
      let cur = els[0]?.id ?? "";
      for (const el of els) if (el.getBoundingClientRect().top - top() <= 0) cur = el.id;
      if (box ? box.scrollTop + box.clientHeight >= box.scrollHeight - 2 : innerHeight + scrollY >= document.documentElement.scrollHeight - 2) cur = els[els.length - 1]?.id ?? cur;
      setActive(cur);
    };
    on();
    const target: HTMLElement | Window = box ?? window;
    target.addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => { target.removeEventListener("scroll", on); removeEventListener("resize", on); };
  }, [selector, root, offset]);

  const go = (id: string) => {
    const t = document.getElementById(id);
    if (!t) return;
    const box = scrollerOf(t);
    const behavior = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    if (box) {
      // distance in the container's own (unscaled) pixels, even when an ancestor is CSS-scaled
      const br = box.getBoundingClientRect(), k = br.height / box.offsetHeight || 1;
      box.scrollTo({ top: box.scrollTop + (t.getBoundingClientRect().top - br.top) / k - 12, behavior });
    } else {
      scrollTo({ top: t.getBoundingClientRect().top + scrollY - offset, behavior });
    }
    setActive(id);
    if (updateHash) history.replaceState(null, "", `#${id}`);
  };

  if (!hs.length) return null;
  const base = Math.min(...hs.map((h) => h.level));
  return (
    <nav aria-label={title} className={`au-toc ${className ?? ""}`} style={style}>
      <style>{CSS}</style>
      <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.5, marginBottom: 10 }}>{title}</div>
      <div style={{ borderLeft: "1px solid var(--au-border,rgb(255 255 255/.12))" }}>
        {hs.map((h) => (
          <a key={h.id} href={`#${h.id}`} aria-current={active === h.id} style={{ paddingLeft: 14 + (h.level - base) * 14 }} onClick={(e) => { e.preventDefault(); go(h.id); }}>{h.text}</a>
        ))}
      </div>
    </nav>
  );
}
