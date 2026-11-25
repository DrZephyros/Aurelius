"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "@/lib/router";
import { frameProps } from "@/lib/demo";
import type { Template } from "@/lib/templates";

/* ───────────────────────────────────────────────────────────
   Specimen — a real template, scrolled THROUGH the host page.
   · no slider, no hover-scrub: the template is part of the landing page
   · a tall track + a sticky stage. The iframe is the template (embed=scroll); its own document height sets the track
     height 1:1, so you scroll the entire preview before the next one arrives
   · the page's scroll position is streamed to the iframe (postMessage scrub), which eases to it frame by frame
   · the iframe is mounted only while the track is near the viewport, so three WebGL worlds never run at once
   ─────────────────────────────────────────────────────────── */

const NAV = 68;

export function Specimen({ t, index, total }: { t: Template; index: number; total: number }) {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [docH, setDocH] = useState<number | null>(null);
  const last = useRef(-1);

  const post = useCallback((m: unknown) => frame.current?.contentWindow?.postMessage(m, "*"), []);

  /** map the page scroll onto 0..1 and hand it to the template */
  const sync = useCallback(() => {
    const tr = track.current, st = stage.current;
    if (!tr || !st) return;
    const range = Math.max(1, tr.offsetHeight - st.offsetHeight);
    const p = Math.min(1, Math.max(0, (NAV - tr.getBoundingClientRect().top) / range));
    if (bar.current) bar.current.style.transform = `scaleY(${p})`;
    if (pct.current) pct.current.textContent = String(Math.round(p * 100)).padStart(2, "0");
    if (Math.abs(p - last.current) > 0.00005) {
      last.current = p;
      post({ md: "scrub", p });
    }
  }, [post]);

  // mount/unmount the heavy iframe by proximity
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setMounted(e.isIntersecting), { rootMargin: "60% 0px 60% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
      if (h && h > 400) setDocH((c) => (c && Math.abs(c - h) < 8 ? c : h));
    } catch {
      /* cross-origin: keep the estimate */
    }
  }, []);

  const onLoad = () => {
    last.current = -1;
    [0, 350, 1200, 3000].forEach((ms) =>
      setTimeout(() => {
        measure();
        sync();
        if (ms === 350) setReady(true);
      }, ms)
    );
  };

  useEffect(() => {
    if (!mounted) { setReady(false); return; }
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
            {...frameProps(t.slug, "embed=scroll")}
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

        {/* overlay chrome */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] flex items-end justify-between gap-4 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 pt-24 sm:p-6">
          <div className="pointer-events-auto flex max-w-[78%] items-center gap-3 rounded-full border border-white/12 bg-black/55 py-2 pl-4 pr-5 backdrop-blur-xl">
            <i className="size-2 shrink-0 rounded-full" style={{ background: t.accent, boxShadow: `0 0 12px ${t.accent}` }} />
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold">
                {t.name}
                <span className="ml-2 font-mono text-[10px] font-normal tracking-[0.16em] text-white/50 uppercase">N°{index + 1} / {total}</span>
              </div>
              <div className="hidden truncate text-[11.5px] text-white/55 sm:block">{t.tagline}</div>
            </div>
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <Link href={`/templates/${t.slug}`} className="btn btn-primary btn-sm">Get {t.name} <span aria-hidden>→</span></Link>
          </div>
        </div>

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
