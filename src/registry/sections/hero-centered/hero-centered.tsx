"use client";

import type { CSSProperties, ReactNode } from "react";

export type HeroCenteredProps = {
  badge?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
  /** Anything rendered under the buttons: screenshot, code block, logos… */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-hc{position:relative;overflow:hidden;text-align:center;padding:clamp(72px,12vw,150px) 24px 72px;isolation:isolate}
.au-hc::before{content:"";position:absolute;left:50%;top:-30%;width:900px;height:700px;transform:translateX(-50%);z-index:-1;background:radial-gradient(closest-side,color-mix(in srgb,var(--au-accent,#5cffc4) 24%,transparent),transparent);filter:blur(30px)}
.au-hc::after{content:"";position:absolute;inset:0;z-index:-1;background-image:linear-gradient(rgb(255 255 255/.05) 1px,transparent 1px),linear-gradient(90deg,rgb(255 255 255/.05) 1px,transparent 1px);background-size:60px 60px;-webkit-mask-image:radial-gradient(60% 55% at 50% 30%,#000,transparent);mask-image:radial-gradient(60% 55% at 50% 30%,#000,transparent)}
.au-hc>*{animation:au-hc-in .9s cubic-bezier(.16,1,.3,1) both}.au-hc>:nth-child(2){animation-delay:.1s}.au-hc>:nth-child(3){animation-delay:.2s}.au-hc>:nth-child(4){animation-delay:.3s}.au-hc>:nth-child(5){animation-delay:.45s}
@keyframes au-hc-in{from{opacity:0;transform:translateY(24px);filter:blur(8px)}}
.au-hc-b{display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border-radius:999px;font-size:13px;border:1px solid var(--au-border,rgb(255 255 255/.14));background:rgb(255 255 255/.05);backdrop-filter:blur(10px)}
.au-hc h1{font-size:clamp(2.6rem,7.5vw,5.8rem);line-height:.98;letter-spacing:-.05em;font-weight:650;margin:22px auto 0;max-width:15ch}
.au-hc p{max-width:560px;margin:22px auto 0;font-size:clamp(1rem,1.6vw,1.2rem);line-height:1.6;opacity:.7}
.au-hc-a{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:34px}
.au-hc-a a{padding:14px 28px;border-radius:999px;font-weight:600;text-decoration:none;transition:transform .3s cubic-bezier(.16,1,.3,1)}.au-hc-a a:hover{transform:translateY(-2px)}
.au-hc-p{background:var(--au-accent,#5cffc4);color:var(--au-bg,#021510)}.au-hc-s{border:1px solid rgb(255 255 255/.22);color:inherit}
@media (prefers-reduced-motion:reduce){.au-hc>*{animation:none}}`;

/** A complete, centred hero: badge, big headline, subcopy, two CTAs and a glow + grid backdrop. */
export function HeroCentered({ badge, title, subtitle, primary, secondary, children, className, style }: HeroCenteredProps) {
  return (
    <section className={`au-hc ${className ?? ""}`} style={style}>
      <style>{CSS}</style>
      <div>{badge && <span className="au-hc-b">{badge}</span>}</div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      <div className="au-hc-a">
        {primary && <a className="au-hc-p" href={primary.href}>{primary.label}</a>}
        {secondary && <a className="au-hc-s" href={secondary.href}>{secondary.label}</a>}
      </div>
      {children && <div style={{ marginTop: 56 }}>{children}</div>}
    </section>
  );
}
