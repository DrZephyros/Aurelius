"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

export type MeteorsProps = {
  count?: number;
  color?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-mt-w{position:relative;overflow:hidden}
.au-mt{position:absolute;height:1px;width:var(--au-len);background:linear-gradient(90deg,var(--au-c),transparent);transform:rotate(-45deg) translateX(0);opacity:0;animation:au-mt var(--au-dur) linear var(--au-del) infinite;pointer-events:none}
.au-mt::before{content:"";position:absolute;left:0;top:50%;width:3px;height:3px;border-radius:50%;background:var(--au-c);box-shadow:0 0 8px 2px var(--au-c);transform:translateY(-50%)}
@keyframes au-mt{0%{opacity:0;transform:rotate(-45deg) translateX(0)}8%{opacity:1}70%{opacity:1}100%{opacity:0;transform:rotate(-45deg) translateX(-900px)}}
@media (prefers-reduced-motion:reduce){.au-mt{display:none}}`;

/** Shooting stars across a section. Meteors are generated after mount, so there is no hydration mismatch. */
export function Meteors({ count = 14, color = "#cfe9ff", children, className, style }: MeteorsProps) {
  const [m, setM] = useState<{ left: number; top: number; len: number; dur: number; del: number }[]>([]);
  useEffect(() => {
    setM(Array.from({ length: count }, () => ({ left: 20 + Math.random() * 90, top: -10 + Math.random() * 45, len: 60 + Math.random() * 90, dur: 2.2 + Math.random() * 3.2, del: Math.random() * 8 })));
  }, [count]);
  return (
    <div className={`au-mt-w ${className ?? ""}`} style={style}>
      <style>{CSS}</style>
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {m.map((x, i) => (
          <span key={i} className="au-mt" style={{ left: `${x.left}%`, top: `${x.top}%`, ["--au-len" as string]: `${x.len}px`, ["--au-dur" as string]: `${x.dur}s`, ["--au-del" as string]: `${x.del}s`, ["--au-c" as string]: color }} />
        ))}
      </div>
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}
