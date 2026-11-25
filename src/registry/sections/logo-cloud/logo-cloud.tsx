"use client";

import type { CSSProperties } from "react";

export type Logo = { name: string; /** Image URL. If omitted the name is rendered as a wordmark. */ src?: string; href?: string };
export type LogoCloudProps = { logos: Logo[]; title?: string; duration?: number; className?: string; style?: CSSProperties };

const CSS = `.au-lc-t{display:flex;gap:56px;width:max-content;animation:au-lc var(--au-dur) linear infinite}
.au-lc:hover .au-lc-t{animation-play-state:paused}
.au-lc-i{display:flex;align-items:center;height:32px;opacity:.45;filter:grayscale(1);transition:opacity .3s,filter .3s;font-weight:650;font-size:20px;letter-spacing:-.03em;white-space:nowrap;color:inherit;text-decoration:none}
.au-lc-i:hover{opacity:1;filter:none}.au-lc-i img{height:100%;width:auto}
@keyframes au-lc{to{transform:translateX(calc(-50% - 28px))}}
@media (prefers-reduced-motion:reduce){.au-lc-t{animation:none}}`;

/** "Trusted by" strip: a grayscale logo marquee that lights up on hover. */
export function LogoCloud({ logos, title = "Trusted by teams at", duration = 40, className, style }: LogoCloudProps) {
  const row = [...logos, ...logos, ...logos, ...logos];
  return (
    <div className={`au-lc ${className ?? ""}`} style={{ textAlign: "center", ...style }}>
      <style>{CSS}</style>
      {title && <div style={{ fontSize: 13, opacity: 0.5, marginBottom: 22, letterSpacing: "0.1em", textTransform: "uppercase" }}>{title}</div>}
      <div style={{ overflow: "hidden", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)", maskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)" }}>
        <div className="au-lc-t" style={{ ["--au-dur" as string]: `${duration}s` }}>
          {row.map((l, i) => {
            const inner = l.src ? <img src={l.src} alt={i < logos.length ? l.name : ""} /> : l.name;
            return l.href ? <a key={i} href={l.href} className="au-lc-i" aria-hidden={i >= logos.length || undefined} tabIndex={i >= logos.length ? -1 : undefined}>{inner}</a> : <span key={i} className="au-lc-i" aria-hidden={i >= logos.length || undefined}>{inner}</span>;
          })}
        </div>
      </div>
    </div>
  );
}
