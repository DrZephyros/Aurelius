"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { PHASES } from "@/lib/skill";
import { PhaseVisual } from "@/components/pipeline-visuals";

const COLORS = ["#5cffc4", "#3de7ff", "#6e9bff", "#a58bff", "#ff7ad9", "#ff9f7a", "#ffd28a", "#b7ff7a"];
const N = PHASES.length;
const SEG_VH = 62; // scroll distance per phase when pinned

function useMedia(q: string) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = matchMedia(q);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [q]);
  return m;
}

/** The pipeline as a scroll-driven machine: the section pins, and scrolling opens one gate at a time. */
export function Pipeline({ heading = true }: { heading?: boolean } = {}) {
  const wrap = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const pinned = useMedia("(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)");

  // scroll position → active phase (pinned mode only)
  useEffect(() => {
    if (!pinned) return;
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = wrap.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const range = r.height - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, range)));
      setActive(Math.min(N - 1, Math.floor(p * N * 0.999)));
    };
    // once scrolling settles inside the pipeline, land on the nearest card
    let settle = 0;
    const snap = () => {
      const el = wrap.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const range = r.height - innerHeight;
      if (-r.top < 0 || -r.top > range) return;
      const p = -r.top / Math.max(1, range);
      const k = Math.min(N - 1, Math.floor(p * N * 0.999));
      const target = r.top + scrollY + ((k + 0.5) / N) * range;
      if (Math.abs(scrollY - target) > 4) scrollTo({ top: target, behavior: "smooth" });
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(read);
      clearTimeout(settle);
      settle = window.setTimeout(snap, 220);
    };
    read();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => { removeEventListener("scroll", on); removeEventListener("resize", on); clearTimeout(settle); if (raf) cancelAnimationFrame(raf); };
  }, [pinned]);

  const go = useCallback((i: number) => {
    const k = Math.max(0, Math.min(N - 1, i));
    if (!pinned) { setActive(k); return; }
    const el = wrap.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + scrollY;
    const range = el.offsetHeight - innerHeight;
    scrollTo({ top: top + ((k + 0.5) / N) * range, behavior: "smooth" });
  }, [pinned]);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = card.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.transform = `perspective(1400px) rotateY(${(x - 0.5) * 3.2}deg) rotateX(${(0.5 - y) * 3.2}deg)`;
  };
  const leave = () => { if (card.current) card.current.style.transform = ""; };

  const p = PHASES[active];
  const c = COLORS[active];

  return (
    <div id="pipeline" className="relative scroll-mt-20" aria-label="The AURA pipeline">
      {heading && <div className="mx-auto max-w-[1320px] px-5 pt-4 pb-10 sm:px-8">
        <div className="eyebrow">The pipeline</div>
        <h2 className="h-display mt-4 text-[clamp(2.2rem,5.4vw,4.8rem)]">Eight gates.<br /><span className="aurora-text">Nothing ships until each one opens.</span></h2>
        <p className="mt-5 max-w-[620px] text-[16px] leading-relaxed text-fg/70">Every phase has an exit criterion and a file to prove it. {pinned ? "Keep scrolling — the machine runs as you do." : "Tap through the gates."}</p>
      </div>}

      <div ref={wrap} style={pinned ? { height: `calc(100vh + ${N * SEG_VH}vh)` } : undefined}>
        <div className={pinned ? "sticky top-0 flex min-h-screen items-center" : ""}>
          <div className="mx-auto w-full max-w-[1320px] px-5 py-6 sm:px-8">
            <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[300px_1fr] lg:gap-10" style={{ "--c": c } as CSSProperties}>
              {/* rail */}
              <div className="relative lg:pt-1">
                <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] lg:hidden" role="tablist" aria-label="Pipeline phases">
                  {PHASES.map((ph, i) => (
                    <button key={ph.n} type="button" role="tab" aria-selected={i === active} onClick={() => go(i)} className="shrink-0 rounded-full border px-4 py-2 font-mono text-[11px] tracking-[0.1em] uppercase transition"
                      style={i === active ? { background: COLORS[i], color: "#021510", borderColor: COLORS[i] } : { borderColor: "rgb(255 255 255 / .12)", color: "var(--color-dim)" }}>{ph.n} · {ph.t}</button>
                  ))}
                </div>
                <div className="relative hidden lg:block">
                  <div className="rail-line"><div className="rail-fill" style={{ height: `${(active / (N - 1)) * 100}%` }} /></div>
                  <ol className="relative space-y-1.5">
                    {PHASES.map((ph, i) => (
                      <li key={ph.n}>
                        <button type="button" onClick={() => go(i)} className="rail-item group" data-state={i === active ? "on" : i < active ? "done" : "idle"} style={{ "--c": COLORS[i] } as CSSProperties} aria-current={i === active ? "step" : undefined}>
                          <span className="rail-node">{i < active ? "✓" : ph.n}</span>
                          <span className="min-w-0">
                            <span className={`block font-display text-[17px] font-semibold tracking-[-0.03em] transition-colors ${i === active ? "text-fg" : i < active ? "text-fg/70" : "text-dim"}`}>{ph.t}</span>
                            <span className={`block truncate font-mono text-[10px] tracking-[0.12em] uppercase transition-all duration-500 ${i === active ? "max-h-5 opacity-100" : "max-h-0 opacity-0"}`} style={{ color: COLORS[i] }}>→ {ph.out}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* stage */}
              <div className="min-w-0">
                <div ref={card} className="pipe-card transition-transform duration-300 ease-out" onPointerMove={move} onPointerLeave={leave} style={{ "--c": c } as CSSProperties}>
                  <div className="ghost-num" key={`g${active}`} style={{ animation: "phase-in .9s var(--ease-out-expo) both" }} aria-hidden>{p.n}</div>
                  <div className="relative grid grid-cols-[minmax(0,1fr)] gap-6 p-6 sm:p-9 lg:min-h-[480px] lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:p-11">
                    <div key={active} className="phase-in flex flex-col">
                      <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] uppercase" style={{ "--i": 0 } as CSSProperties}>
                        <span className="rounded-full border px-3 py-1" style={{ color: c, borderColor: `${c}66`, background: `${c}14` }}>Gate {p.n}</span>
                        <span className="text-dim">{active + 1} / {N}</span>
                      </div>
                      <h3 className="h-display mt-6 text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.95]" style={{ "--i": 1 } as CSSProperties}>{p.t}</h3>
                      <p className="mt-5 max-w-[460px] text-[15.5px] leading-relaxed text-fg/75" style={{ "--i": 2 } as CSSProperties}>{p.d}</p>
                      <div className="mt-auto pt-8" style={{ "--i": 3 } as CSSProperties}>
                        <div className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">Exit criterion</div>
                        <div className="relative mt-2 inline-flex items-center gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: `${c}55`, background: `${c}10` }}>
                          <span className="font-mono text-[13px] text-fg">{p.out}</span>
                          <span className="grid size-6 place-items-center rounded-full text-[13px] font-bold text-[#021510]" style={{ background: c, animation: "stamp .6s .55s var(--ease-out-expo) both", opacity: 0 }}>✓</span>
                          <i className="absolute inset-0 rounded-2xl" style={{ boxShadow: `0 0 0 1px ${c}`, animation: "pulse-ring 1.6s .5s ease-out 2", opacity: 0 }} />
                        </div>
                      </div>
                    </div>
                    <div key={`v${active}`} className="viewport min-h-[300px] lg:min-h-[360px]" aria-hidden>
                      <PhaseVisual index={active} />
                    </div>
                  </div>
                </div>

                {/* controls */}
                <div className="mt-5 flex items-center gap-4">
                  <div className="flex flex-1 gap-1.5" aria-hidden>
                    {PHASES.map((ph, i) => (<i key={ph.n} className="h-1 flex-1 rounded-full transition-all duration-700" style={{ background: i <= active ? COLORS[i] : "rgb(255 255 255 / .1)", boxShadow: i === active ? `0 0 12px ${COLORS[i]}` : "none" }} />))}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous gate" className="btn btn-ghost !h-10 !w-10 !px-0 disabled:opacity-30">←</button>
                    <button type="button" onClick={() => go(active + 1)} disabled={active === N - 1} aria-label="Next gate" className="btn btn-ghost !h-10 !w-10 !px-0 disabled:opacity-30">→</button>
                  </div>
                </div>
                {pinned && active === 0 && <div className="mt-4 flex items-center gap-2 font-mono text-[10.5px] tracking-[0.2em] text-dim uppercase"><span style={{ animation: "bob 1.6s ease-in-out infinite" }}>↓</span> Scroll to open the next gate</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
