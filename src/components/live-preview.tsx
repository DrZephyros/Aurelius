"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { frameProps } from "@/lib/demo";

/* Live scenes are WebGL-heavy, so only a few run at once (fewer on touch devices). Cards past the cap keep their poster
   and take a slot as soon as one frees up. */
const MAX_LIVE = typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches ? 2 : 4;
let liveCount = 0;
const waiting = new Set<() => void>();
const pump = () => { for (const w of [...waiting]) { if (liveCount >= MAX_LIVE) break; w(); } };

/** Grants a live-scene slot while `want` holds; queues up when every slot is busy. */
function useLiveSlot(want: boolean): boolean {
  const [granted, setGranted] = useState(false);
  useEffect(() => {
    if (!want) { setGranted(false); return; }
    let held = false;
    const acquire = () => {
      if (held || liveCount >= MAX_LIVE) return false;
      liveCount++;
      held = true;
      setGranted(true);
      return true;
    };
    const waiter = () => { if (acquire()) waiting.delete(waiter); };
    if (!acquire()) waiting.add(waiter);
    return () => {
      waiting.delete(waiter);
      if (held) { held = false; liveCount--; setGranted(false); pump(); }
    };
  }, [want]);
  return granted;
}

const W = 1120; // virtual viewport the thumbnail renders at
const H = 700;

/** Lazy, auto-playing thumbnail of a real template. Only runs while on screen.
 *  Wrap in <ScrubSurface> (components/scrub.tsx) to let the cursor drive the template's scroll position. */
export function LivePreview({
  slug,
  accent,
  bg,
  name,
  frameRef,
  onFrameLoad,
}: {
  slug: string;
  accent: string;
  bg: string;
  name: string;
  frameRef?: RefObject<HTMLIFrameElement | null>;
  onFrameLoad?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ownFrame = useRef<HTMLIFrameElement>(null);
  const frame = frameRef ?? ownFrame;
  const [vis, setVis] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [poster, setPoster] = useState(true);
  const [scale, setScale] = useState(0.34);
  // Cards show a rendered poster instantly; the LIVE scene boots as soon as the card is on screen (no hover needed),
  // within the slot cap, with a timeout back to the poster if the machine can't keep up.
  const granted = useLiveSlot(vis);
  const live = granted && !failed;

  useEffect(() => {
    if (!live) return;
    const t = setTimeout(() => { if (!ready) { setFailed(true); } }, 16000);
    return () => clearTimeout(t);
  }, [live, ready]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVis(e.isIntersecting);
        if (!e.isIntersecting) { setReady(false); setFailed(false); }
      },
      { rootMargin: "80px", threshold: 0.15 }
    );
    io.observe(el);
    const ro = new ResizeObserver(() => setScale(el.clientWidth / W));
    ro.observe(el);
    setScale(el.clientWidth / W);
    return () => {
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative aspect-[16/10] w-full overflow-hidden"
      style={{ background: `radial-gradient(120% 90% at 30% 20%, ${accent}33, transparent 60%), ${bg}` }}
    >
      {poster && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/posters/${slug}.jpg`} alt="" loading="lazy" onError={() => setPoster(false)} className="absolute inset-0 h-full w-full object-cover" />
      )}
      {/* loading veil: visible until the live scene fades in */}
      <div className={`absolute inset-0 grid place-items-center transition-opacity duration-700 ${ready || (poster && !live) ? "opacity-0" : "opacity-100"}`}>
        <div className="flex flex-col items-center gap-3">
          <span className="size-2 rounded-full" style={{ background: accent, boxShadow: `0 0 18px ${accent}`, animation: "pulse-dot 1.4s infinite" }} />
          <span className="font-mono text-[10px] tracking-[0.3em] text-white/50 uppercase">{live ? "Rendering" : name}</span>
        </div>
      </div>
      {live && (
        <iframe
          ref={frame}
          {...frameProps(slug, "embed=card")}
          title={`${name} live preview`}
          tabIndex={-1}
          loading="lazy"
          onLoad={() => {
            setTimeout(() => setReady(true), 600);
            onFrameLoad?.();
          }}
          className={`absolute left-0 top-0 border-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
          style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "0 0", pointerEvents: "none" }}
        />
      )}
    </div>
  );
}

/** Full-bleed ambient backdrop for the hero (no UI, camera on auto-play). */
export function HeroBackdrop({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLive(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="absolute inset-0">
      {live && (
        <iframe
          {...frameProps(slug, "embed=bg&period=60")}
          title="Ambient 3D backdrop"
          tabIndex={-1}
          aria-hidden
          onLoad={() => setTimeout(() => setReady(true), 500)}
          className={`absolute inset-0 size-full border-0 transition-opacity duration-[1600ms] ${ready ? "opacity-100" : "opacity-0"}`}
          style={{ pointerEvents: "none" }}
        />
      )}
    </div>
  );
}
