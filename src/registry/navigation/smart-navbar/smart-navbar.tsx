"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

export type SmartNavbarProps = {
  logo: ReactNode;
  links: { label: string; href: string }[];
  cta?: { label: string; href: string };
  /** Scroll distance (px) before the bar hides on scroll-down. */
  hideAfter?: number;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-nb{position:fixed;top:0;left:0;right:0;z-index:50;transition:transform .5s cubic-bezier(.16,1,.3,1),background .3s,border-color .3s,backdrop-filter .3s;border-bottom:1px solid transparent}
.au-nb.au-solid{background:rgb(4 6 12/.7);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-color:var(--au-border,rgb(255 255 255/.1))}
.au-nb.au-hide{transform:translateY(-100%)}
.au-nb-in{max-width:1200px;margin:0 auto;height:64px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.au-nb a{color:inherit;text-decoration:none}
.au-nb-l{display:flex;gap:6px}.au-nb-l a{padding:8px 14px;border-radius:999px;font-size:14px;opacity:.7;transition:opacity .2s,background .2s}.au-nb-l a:hover{opacity:1;background:rgb(255 255 255/.08)}
.au-nb-cta{padding:9px 18px;border-radius:999px;font-size:14px;font-weight:600;background:var(--au-accent,#5cffc4);color:var(--au-bg,#021510)!important}
.au-nb-b{display:none;width:40px;height:40px;border-radius:12px;border:1px solid rgb(255 255 255/.15);place-items:center}
.au-nb-m{display:none}
@media(max-width:760px){.au-nb-l,.au-nb-cta.au-d{display:none}.au-nb-b{display:grid}.au-nb-m.au-open{display:flex;flex-direction:column;padding:8px 20px 20px;background:rgb(4 6 12/.95)}.au-nb-m a{padding:14px 4px;border-bottom:1px solid rgb(255 255 255/.08)}}`;

/** Fixed header that hides while scrolling down, returns on scroll up, and turns to frosted glass once you leave the top. */
export function SmartNavbar({ logo, links, cta, hideAfter = 120, className, style }: SmartNavbarProps) {
  const [solid, setSolid] = useState(false);
  const [hide, setHide] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = scrollY;
    const on = () => {
      const y = scrollY;
      setSolid(y > 24);
      if (Math.abs(y - last) > 6) { setHide(y > last && y > hideAfter); last = y; }
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, [hideAfter]);

  return (
    <header className={`au-nb ${solid ? "au-solid" : ""} ${hide && !open ? "au-hide" : ""} ${className ?? ""}`} style={style}>
      <style>{CSS}</style>
      <div className="au-nb-in">
        <a href="/" style={{ fontWeight: 700 }}>{logo}</a>
        <nav className="au-nb-l" aria-label="Main">{links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}</nav>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {cta && <a href={cta.href} className="au-nb-cta au-d">{cta.label}</a>}
          <button className="au-nb-b" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? "✕" : "☰"}</button>
        </div>
      </div>
      <nav className={`au-nb-m ${open ? "au-open" : ""}`} aria-label="Mobile" onClick={() => setOpen(false)}>
        {links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
        {cta && <a href={cta.href} style={{ fontWeight: 600, color: "var(--au-accent,#5cffc4)" }}>{cta.label} →</a>}
      </nav>
    </header>
  );
}
