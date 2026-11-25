import { useEffect, useRef, useState, type RefObject } from "react";
import { frameProps } from "@/lib/demo";

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
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  const [scale, setScale] = useState(0.34);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setLive(e.isIntersecting);
        if (!e.isIntersecting) setReady(false);
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
      {/* poster: visible until the live scene fades in */}
      <div className={`absolute inset-0 grid place-items-center transition-opacity duration-700 ${ready ? "opacity-0" : "opacity-100"}`}>
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
