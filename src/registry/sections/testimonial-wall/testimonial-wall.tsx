"use client";

import type { CSSProperties } from "react";

export type Testimonial = { quote: string; name: string; role?: string; avatar?: string };
export type TestimonialWallProps = { testimonials: Testimonial[]; columns?: 2 | 3 | 4; /** Seconds per loop (higher = slower). */ duration?: number; height?: number; className?: string; style?: CSSProperties };

const CSS = `.au-tw{display:grid;gap:16px;overflow:hidden;-webkit-mask-image:linear-gradient(180deg,transparent,#000 14%,#000 86%,transparent);mask-image:linear-gradient(180deg,transparent,#000 14%,#000 86%,transparent)}
.au-tw-c{display:flex;flex-direction:column;gap:16px}.au-tw-c>div{display:flex;flex-direction:column;gap:16px;animation:au-twu var(--au-dur) linear infinite;animation-direction:var(--au-dir)}
.au-tw:hover .au-tw-c>div{animation-play-state:paused}
@keyframes au-twu{to{transform:translateY(calc(-50% - 8px))}}
.au-tw-k{padding:22px;border-radius:20px;border:1px solid var(--au-border,rgb(255 255 255/.1));background:rgb(255 255 255/.04);font-size:14.5px;line-height:1.6}
.au-tw-k footer{display:flex;align-items:center;gap:10px;margin-top:16px;font-size:13px}.au-tw-k footer img,.au-tw-k footer i{width:34px;height:34px;border-radius:50%;object-fit:cover;background:linear-gradient(135deg,#5cffc4,#a58bff);flex-shrink:0}
@media(max-width:860px){.au-tw{grid-template-columns:repeat(2,1fr)!important}.au-tw-c:nth-child(n+3){display:none}}@media(max-width:560px){.au-tw{grid-template-columns:1fr!important}.au-tw-c:nth-child(n+2){display:none}}
@media (prefers-reduced-motion:reduce){.au-tw-c>div{animation:none}}`;

/** Auto-scrolling columns of testimonial cards (alternating directions). Pauses on hover. */
export function TestimonialWall({ testimonials, columns = 3, duration = 50, height = 560, className, style }: TestimonialWallProps) {
  const cols = Array.from({ length: columns }, (_, c) => testimonials.filter((_, i) => i % columns === c));
  return (
    <div className={`au-tw ${className ?? ""}`} style={{ gridTemplateColumns: `repeat(${columns},1fr)`, height, ...style }}>
      <style>{CSS}</style>
      {cols.map((col, c) => (
        <div key={c} className="au-tw-c">
          <div style={{ ["--au-dur" as string]: `${duration + c * 8}s`, ["--au-dir" as string]: c % 2 ? "reverse" : "normal" }}>
            {[...col, ...col].map((t, i) => (
              <figure key={i} className="au-tw-k" style={{ margin: 0 }} aria-hidden={i >= col.length || undefined}>
                <blockquote style={{ margin: 0 }}>“{t.quote}”</blockquote>
                <footer>{t.avatar ? <img src={t.avatar} alt="" /> : <i />}<span><b style={{ fontWeight: 600 }}>{t.name}</b>{t.role && <span style={{ opacity: 0.55, display: "block" }}>{t.role}</span>}</span></footer>
              </figure>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
