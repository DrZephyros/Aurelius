"use client";

import type { CSSProperties, ReactNode } from "react";

export type CtaBannerProps = {
  title: ReactNode;
  description?: ReactNode;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-cb{position:relative;overflow:hidden;isolation:isolate;text-align:center;padding:clamp(48px,8vw,96px) 28px;border-radius:32px;border:1px solid var(--au-border,rgb(255 255 255/.12));background:#080c15}
.au-cb::before,.au-cb::after{content:"";position:absolute;z-index:-1;width:60%;aspect-ratio:1;border-radius:50%;filter:blur(70px);opacity:.5;animation:au-cb 14s ease-in-out infinite alternate}
.au-cb::before{left:-12%;top:-40%;background:var(--au-accent,#5cffc4)}.au-cb::after{right:-12%;bottom:-50%;background:var(--au-accent-2,#a58bff);animation-delay:-7s}
@keyframes au-cb{to{transform:translate(12%,10%) scale(1.2)}}
.au-cb h2{font-size:clamp(2rem,5vw,3.8rem);line-height:1.02;letter-spacing:-.045em;font-weight:650;margin:0 auto;max-width:18ch}
.au-cb p{margin:16px auto 0;max-width:46ch;opacity:.7;line-height:1.6}
.au-cb-a{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:30px}
.au-cb-a a{padding:14px 28px;border-radius:999px;font-weight:600;text-decoration:none;transition:transform .3s cubic-bezier(.16,1,.3,1)}.au-cb-a a:hover{transform:translateY(-2px)}
.au-cb-p{background:#fff;color:#04060c}.au-cb-s{border:1px solid rgb(255 255 255/.3);color:inherit}
@media (prefers-reduced-motion:reduce){.au-cb::before,.au-cb::after{animation:none}}`;

/** A closing call-to-action card with drifting aurora light. */
export function CtaBanner({ title, description, primary, secondary, className, style }: CtaBannerProps) {
  return (
    <section className={`au-cb ${className ?? ""}`} style={style}>
      <style>{CSS}</style>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      <div className="au-cb-a">
        <a className="au-cb-p" href={primary.href}>{primary.label}</a>
        {secondary && <a className="au-cb-s" href={secondary.href}>{secondary.label}</a>}
      </div>
    </section>
  );
}
