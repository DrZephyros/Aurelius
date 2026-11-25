"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "@/lib/router";
import { downloadDemo, kitUrl, type Demo } from "@/lib/collections";
import { ScrubSurface } from "./scrub";

const W = 1280;
const H = 800;

/** Lazy, scaled, non-interactive thumbnail of a real demo page. Only renders while on screen. */
export function DemoThumb({ demo, ratio = "aspect-[16/10]", frameRef, onFrameLoad }: { demo: Demo; ratio?: string; frameRef?: import("react").RefObject<HTMLIFrameElement | null>; onFrameLoad?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { rootMargin: "120px", threshold: 0.05 });
    io.observe(el);
    const ro = new ResizeObserver(() => setScale(el.clientWidth / W));
    ro.observe(el);
    setScale(el.clientWidth / W);
    return () => { io.disconnect(); ro.disconnect(); };
  }, []);

  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden ${ratio}`}
      style={{ background: `radial-gradient(120% 90% at 30% 20%, ${demo.accent}30, transparent 60%), ${demo.bg}` }}
    >
      <div className={`absolute inset-0 grid place-items-center transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}>
        <span className="size-2 rounded-full" style={{ background: demo.accent, boxShadow: `0 0 18px ${demo.accent}`, animation: "pulse-dot 1.4s infinite" }} />
      </div>
      {live && (
        <iframe
          ref={frameRef}
          src={kitUrl(demo, "embed=card")}
          title={`${demo.name} preview`}
          tabIndex={-1}
          loading="lazy"
          onLoad={() => { setTimeout(() => setReady(true), 250); onFrameLoad?.(); }}
          className={`absolute left-0 top-0 border-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
          style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "0 0", pointerEvents: "none" } as CSSProperties}
        />
      )}
    </div>
  );
}

const base = (d: Demo) => (d.kind === "page" ? "/pages/" : "/elements/");

export function DemoCard({ demo, index }: { demo: Demo; index: number }) {
  return (
    <article className="tcard panel spot group overflow-hidden !rounded-[24px]" style={{ "--c": demo.accent } as CSSProperties}>
      <Link href={base(demo) + demo.slug} className="block" aria-label={`Open ${demo.name}`}>
        <div className="flex items-center gap-3 border-b border-line bg-black/40 px-4 py-2.5">
          <div className="flex gap-1.5">
            <i className="size-2 rounded-full bg-white/15" /><i className="size-2 rounded-full bg-white/15" /><i className="size-2 rounded-full bg-white/15" />
          </div>
          <div className="min-w-0 flex-1 truncate rounded-full border border-line bg-black/30 px-3 py-1 text-center font-mono text-[10.5px] text-dim">
            {demo.kind === "page" ? `/${demo.slug}` : `<${demo.slug} />`}
          </div>
          <span className="font-mono text-[9.5px] tracking-[0.18em] text-dim uppercase">N°{String(index + 1).padStart(2, "0")}</span>
        </div>
        <ScrubSurface accent={demo.accent} hint="Hover to explore">
          {({ frameRef, onLoad }) => (
            <>
              <DemoThumb demo={demo} frameRef={frameRef} onFrameLoad={onLoad} />
              <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12.5px] font-semibold text-black shadow-2xl">
                  {demo.kind === "page" ? "Open the page" : "Play with it"}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M7 17 17 7M8 7h9v9" /></svg>
                </span>
              </div>
            </>
          )}
        </ScrubSurface>
        <div className="px-5 pt-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-display text-[22px] font-semibold tracking-[-0.03em]">{demo.name}</h3>
            <span className="chip mt-1 shrink-0">{demo.category}</span>
          </div>
          <p className="mt-1 text-sm leading-snug text-dim">{demo.tagline}</p>
        </div>
      </Link>
      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2 px-5 pb-5">
        <Link href={base(demo) + demo.slug} className="btn btn-ghost btn-sm">Preview · source</Link>
        <button type="button" onClick={() => downloadDemo(demo)} className="btn btn-primary btn-sm" aria-label={`Download ${demo.name}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M12 3v13m0 0 5-5m-5 5-5-5M4 21h16" /></svg>
          .html
        </button>
      </div>
    </article>
  );
}
