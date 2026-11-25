"use client";

import { useEffect, useMemo, useRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { LivePreview } from "./live-preview";

/* ───────────────────────────────────────────────────────────
   Scrub surface — move the cursor across a preview and the real page inside it glides to that point.
   · the rail eases toward the pointer every frame (no stepping)
   · the position is streamed to the iframe, whose bridge eases again (see PREVIEW_BRIDGE in lib/demo.ts)
   · the rail colour is derived from the project's own accent, lifted so it always reads on dark glass
   · works with a mouse (hover) and with touch (drag the rail)
   ─────────────────────────────────────────────────────────── */

const hexRgb = (h: string): [number, number, number] => {
  const x = h.replace("#", "");
  const f = x.length === 3 ? x.split("").map((c) => c + c).join("") : x;
  return [parseInt(f.slice(0, 2), 16), parseInt(f.slice(2, 4), 16), parseInt(f.slice(4, 6), 16)];
};
const lum = ([r, g, b]: number[]) => {
  const c = [r, g, b].map((v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

/** The project's accent, lightened just enough to stay legible on the dark rail. */
export function railColor(accent: string): string {
  let rgb = hexRgb(accent);
  for (let i = 0; i < 12 && lum(rgb) < 0.22; i++) rgb = rgb.map((v) => Math.round(v + (255 - v) * 0.12)) as [number, number, number];
  return `rgb(${rgb.join(" ")})`;
}

type Post = (m: unknown) => void;

export function ScrubSurface({
  accent,
  className = "",
  hint = "Hover to scrub",
  children,
}: {
  accent: string;
  className?: string;
  hint?: string;
  children: (api: { frameRef: RefObject<HTMLIFrameElement | null>; onLoad: () => void }) => ReactNode;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const color = useMemo(() => railColor(accent), [accent]);
  const S = useRef({ target: 0, shown: 0, active: false, raf: 0, last: 0, touching: false });

  const post: Post = (m) => frameRef.current?.contentWindow?.postMessage(m, "*");

  const paint = () => {
    const { shown, active, touching } = S.current;
    const pct = `${shown * 100}%`;
    if (fill.current) fill.current.style.width = pct;
    if (thumb.current) thumb.current.style.left = pct;
    if (label.current) label.current.textContent = active || touching ? `${String(Math.round(shown * 100)).padStart(2, "0")}%` : hint;
    if (rail.current) rail.current.style.opacity = active || touching ? "1" : "0.7";
  };

  const tick = (now: number) => {
    const s = S.current;
    const dt = Math.min(0.05, (now - s.last) / 1000);
    s.last = now;
    s.shown += (s.target - s.shown) * (1 - Math.exp(-dt * 11)); // frame-rate independent glide
    if (Math.abs(s.target - s.shown) < 0.0004) s.shown = s.target;
    paint();
    post({ md: "scrub", p: s.shown });
    s.raf = s.active || s.touching || s.shown !== s.target ? requestAnimationFrame(tick) : 0;
  };
  const kick = () => {
    if (!S.current.raf) { S.current.last = performance.now(); S.current.raf = requestAnimationFrame(tick); }
  };
  const release = () => {
    S.current.active = false;
    S.current.touching = false;
    paint();
    post({ md: "scrub", p: null });
  };

  useEffect(() => () => cancelAnimationFrame(S.current.raf), []);

  const fromArea = (clientX: number) => {
    const r = area.current!.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width));
  };
  const fromRail = (clientX: number) => {
    const t = rail.current!.querySelector("[data-track]") as HTMLElement;
    const r = t.getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width));
  };

  return (
    <div
      ref={area}
      className={`relative ${className}`}
      style={{ "--rail": color } as CSSProperties}
      onPointerMove={(e) => {
        if (e.pointerType === "touch" || S.current.touching) return;
        const s = S.current;
        s.active = true;
        s.target = fromArea(e.clientX);
        const r = area.current!.getBoundingClientRect();
        post({ md: "pointer", x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
        kick();
      }}
      onPointerLeave={() => { if (!S.current.touching) release(); }}
    >
      {children({
        frameRef,
        // a freshly loaded frame learns the current state straight away
        onLoad: () => { if (S.current.active || S.current.touching) post({ md: "scrub", p: S.current.shown }); },
      })}

      {/* scrub rail — colour follows the project */}
      <div
        ref={rail}
        className="absolute inset-x-0 bottom-0 flex h-11 touch-none items-end gap-3 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-3.5 pb-2.5 transition-opacity duration-300"
        style={{ opacity: 0.7 }}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          const s = S.current;
          s.touching = true;
          s.target = fromRail(e.clientX);
          kick();
        }}
        onPointerMove={(e) => {
          if (!S.current.touching) return;
          e.stopPropagation();
          S.current.target = fromRail(e.clientX);
          kick();
        }}
        onPointerUp={(e) => { e.stopPropagation(); release(); }}
        onPointerCancel={release}
      >
        <span ref={label} className="w-[104px] shrink-0 whitespace-nowrap font-mono text-[9.5px] leading-3 tracking-[0.16em] text-white/80 uppercase" style={{ textShadow: "0 1px 6px #000" }}>{hint}</span>
        <div data-track className="relative mb-[3px] h-[3px] flex-1 cursor-ew-resize rounded-full bg-white/22">
          <div ref={fill} className="absolute inset-y-0 left-0 w-0 rounded-full" style={{ background: "linear-gradient(90deg, color-mix(in srgb, var(--rail) 35%, transparent), var(--rail))", boxShadow: "0 0 14px var(--rail)" }} />
          <div ref={thumb} className="absolute top-1/2 left-0 size-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" style={{ background: "var(--rail)", boxShadow: "0 0 0 4px color-mix(in srgb, var(--rail) 28%, transparent), 0 0 16px var(--rail)" }} />
        </div>
      </div>
    </div>
  );
}

/** A live 3D template preview with the scrub rail. Used by the Home specimens and the library. */
export function ScrubPreview({ slug, accent, bg, name, className = "" }: { slug: string; accent: string; bg: string; name: string; className?: string }) {
  return (
    <ScrubSurface accent={accent} className={className}>
      {({ frameRef, onLoad }) => <LivePreview slug={slug} accent={accent} bg={bg} name={name} frameRef={frameRef} onFrameLoad={onLoad} />}
    </ScrubSurface>
  );
}
