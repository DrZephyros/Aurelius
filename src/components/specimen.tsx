"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { frameProps } from "@/lib/demo";
import type { Template } from "@/lib/templates";

/* ───────────────────────────────────────────────────────────
   Specimen — a real template, scrolled THROUGH the host page.
   · no slider, no hover-scrub: the template is part of the landing page
   · a tall track + a sticky stage. The iframe is the template (embed=scroll); its own document height sets the track
     height 1:1, so you scroll the entire preview before the next one arrives
   · the page's scroll position is streamed to the iframe, which eases to it frame by frame
   · WARM-UP: worlds are booted *ahead* of the scroll, one after another (see `load` / `onReady`), so by the time the reader
     reaches a specimen it is already compiled, faded in and measured. Once loaded it stays mounted (no reload when you scroll
     back) and is simply parked (render loop paused) while it is far off-screen, so three WebGL worlds never run at once.
   ─────────────────────────────────────────────────────────── */

const NAV = 68;

/** doc heights are remembered per viewport size, so the track never jumps on a revisit */
const hKey = (slug: string) => `aurelius:docH:${slug}:${innerWidth}x${innerHeight}`;
const readH = (slug: string): number | null => {
  try {
    const v = Number(sessionStorage.getItem(hKey(slug)));
    return v > 400 ? v : null;
  } catch {
    return null;
  }
};

/** while a stage fills the whole viewport the fixed aurora behind the page is invisible — the hero scene parks itself */
const covering = new Set<string>();
const setCovering = (slug: string, on: boolean) => {
  if (on) covering.add(slug);
  else covering.delete(slug);
  document.documentElement.toggleAttribute("data-covered", covering.size > 0);
};

export function Specimen({
  t,
  load = true,
  onReady,
  src,
}: {
  t: Pick<Template, "slug" | "name" | "tagline" | "accent" | "bg">;
  /** permission to start booting (the landing page warms specimens up one at a time, ahead of the reader) */
  load?: boolean;
  /** fired once the world has rendered and faded in */
  onReady?: () => void;
  /** Optional same-origin experience, such as the Yoru bundle. */
  src?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const [near, setNear] = useState(false); // within ~1.5 screens: boot immediately, whatever the queue says
  const [ready, setReady] = useState(false);
  const [docH, setDocH] = useState<number | null>(() => readH(t.slug));
  const last = useRef(-1);
  const isReady = useRef(false);
  const nearRef = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  // once booting has been allowed it is never torn down
  const mounted = load || near;

  const post = useCallback((m: unknown) => frame.current?.contentWindow?.postMessage(m, "*"), []);

  /** map the page scroll onto 0..1 and hand it to the template */
  const sync = useCallback(() => {
    const tr = track.current, st = stage.current;
    if (!tr || !st) return;
    const range = Math.max(1, tr.offsetHeight - st.offsetHeight);
    const r = tr.getBoundingClientRect();
    setCovering(t.slug, r.top <= NAV + 1 && r.bottom >= innerHeight - 1);
    const p = Math.min(1, Math.max(0, (NAV - r.top) / range));
    if (bar.current) bar.current.style.transform = `scaleY(${p})`;
    if (pct.current) pct.current.textContent = String(Math.round(p * 100)).padStart(2, "0");
    if (Math.abs(p - last.current) > 0.00005) {
      last.current = p;
      post({ md: "scrub", p });
    }
  }, [post, t.slug]);

  useEffect(() => () => setCovering(t.slug, false), [t.slug]);

  /** park / wake the world: only render while it is (almost) on screen */
  const park = useCallback(() => {
    if (isReady.current) post({ md: "pause", on: !nearRef.current });
  }, [post]);

  // proximity: a generous margin so the world is awake and positioned well before it enters the viewport
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        nearRef.current = e.isIntersecting;
        setNear(e.isIntersecting);
        if (e.isIntersecting) post({ md: "pause", on: false });
        else park();
        if (e.isIntersecting) sync();
      },
      { rootMargin: "150% 0px 150% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [park, post, sync]);

  // scroll → template
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    };
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    on();
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", on);
      removeEventListener("resize", on);
    };
  }, [sync, docH]);

  /** read the template's real height so the track is exactly as long as the page it hosts */
  const measure = useCallback(() => {
    try {
      const h = frame.current?.contentDocument?.documentElement.scrollHeight;
      if (h && h > 400) {
        setDocH((c) => (c && Math.abs(c - h) < 8 ? c : h));
        try { sessionStorage.setItem(hKey(t.slug), String(h)); } catch { /* private mode */ }
      }
    } catch {
      /* cross-origin: keep the estimate */
    }
  }, [t.slug]);

  const markReady = useCallback(() => {
    if (isReady.current) return;
    isReady.current = true;
    measure();
    setReady(true);
    last.current = -1;
    sync();
    park();
    onReadyRef.current?.();
  }, [measure, sync, park]);

  // the template tells us when it has rendered and faded in
  useEffect(() => {
    const on = (e: MessageEvent) => {
      if (e.data?.md === "ready" && e.source && e.source === frame.current?.contentWindow) markReady();
    };
    addEventListener("message", on);
    return () => removeEventListener("message", on);
  }, [markReady]);

  const onLoad = () => {
    last.current = -1;
    [0, 350, 1200, 3000].forEach((ms) =>
      setTimeout(() => {
        measure();
        sync();
      }, ms)
    );
    // safety net: never leave the queue (or the veil) hanging on a world that can't report back
    setTimeout(markReady, 7000);
  };

  useEffect(() => {
    if (!mounted) return;
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, [mounted, measure]);

  return (
    <div
      ref={track}
      id={`specimen-${t.slug}`}
      className="relative"
      style={{ height: docH ? `${docH}px` : "520svh", ["--c" as string]: t.accent } as CSSProperties}
    >
      <div ref={stage} className="sticky overflow-hidden border-y border-white/10 bg-black" style={{ top: NAV, height: `calc(100svh - ${NAV}px)`, background: t.bg }}>
        {/* loading veil */}
        <div className={`absolute inset-0 z-[1] grid place-items-center transition-opacity duration-700 ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`} style={{ background: `radial-gradient(70% 60% at 50% 40%, ${t.accent}26, ${t.bg})` }}>
          <div className="text-center">
            <span className="mx-auto block size-2 rounded-full" style={{ background: t.accent, boxShadow: `0 0 22px ${t.accent}`, animation: "pulse-dot 1.4s infinite" }} />
            <div className="mt-5 font-display text-2xl font-semibold tracking-[-0.03em]">{t.name}</div>
            <div className="mt-1 font-mono text-[10.5px] tracking-[0.2em] text-dim uppercase">Booting the world…</div>
          </div>
        </div>

        {mounted && (
          <iframe
            ref={frame}
            {...(src ? { src } : frameProps(t.slug, "embed=scroll"))}
            title={`${t.name} — live specimen`}
            tabIndex={-1}
            onLoad={onLoad}
            className="absolute inset-0 h-full w-full border-0"
            style={{ pointerEvents: "none" }}
          />
        )}

        {/* pointer surface: the iframe can't take the wheel (the page scrolls), so hover is forwarded to it */}
        <div
          className="absolute inset-0 z-[2]"
          onPointerMove={(e) => {
            if (e.pointerType === "touch") return;
            const r = e.currentTarget.getBoundingClientRect();
            post({ md: "pointer", x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
          }}
        />

        {/* scroll progress through this specimen */}
        <div className="pointer-events-none absolute bottom-24 right-4 top-6 z-[3] hidden w-px bg-white/15 sm:block">
          <div ref={bar} className="h-full origin-top bg-aurora" style={{ transform: "scaleY(0)", background: t.accent }} />
        </div>
        <div className="pointer-events-none absolute right-3 top-3 z-[3] hidden rounded-full bg-black/55 px-2.5 py-1 font-mono text-[10px] tracking-[0.14em] text-white/70 backdrop-blur-md sm:block">
          <span ref={pct}>00</span>%
        </div>
      </div>
    </div>
  );
}
