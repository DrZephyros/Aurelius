/* Pipeline: a pinned, scroll-driven walk through the phases of a build.
 * Self-contained: PHASES data, visuals, and CSS live in this file.
 * Needs the Aurelius theme tokens (--ease-out-expo, --font-display, --font-mono, --color-dim)
 * for the easing and fonts; without them the animation falls back to browser defaults.
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

const PHASES: { n: string; t: string; d: string; out: string }[] = [
  { n: "00", t: "Intake", d: "Subject, audience, the one emotion, the single conversion. Ask at most five questions — then decide.", out: "one-sentence project" },
  { n: "01", t: "Concept", d: "Find the world metaphor. Run the authorship test: could a competitor paste this on their site?", out: "AURA_BRIEF.md" },
  { n: "02", t: "Storyboard", d: "5–9 chapters with scroll ranges, shots, lenses, copy, type treatments and transitions. At least one hold.", out: "STORYBOARD.md" },
  { n: "03", t: "Assets", d: "Procedural, generated-image 2.5D, GLB or frame-sequence — with the prompts and a 12 MB budget.", out: "ASSETS.md" },
  { n: "04", t: "Scaffold", d: "Drop in the starter engine. Confirm the reference scene scrubs at 60fps before touching anything.", out: "running dev server" },
  { n: "05", t: "Build the world", d: "Blockout → light → materials → atmosphere → type → grade → interaction → conversion. In that order.", out: "the film" },
  { n: "06", t: "Polish ×3", d: "Motion pass, image pass, detail pass. Kill every flat frame.", out: "3 passes logged" },
  { n: "07", t: "QA gate", d: "Playwright screenshots, FPS, fallbacks, reduced motion, mobile. Ship only at ≥ 85 / 100.", out: "Aura Score" },
];

/* One small, living illustration per pipeline phase. Each is remounted (keyed) when its phase
   becomes active, so its entrance animation replays every time. Pure CSS/SVG — no assets. */

const st = (o: Record<string, string | number>) => o as CSSProperties;

function useCount(to: number, ms = 1500, delay = 350) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now() + delay;
    const tick = (t: number) => {
      const k = Math.max(0, Math.min(1, (t - t0) / ms));
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms, delay]);
  return v;
}

/* 00 — five questions, then one sentence */
function Intake() {
  const qs = ["Subject", "Audience", "The one emotion", "The single conversion", "Hard constraints"];
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 p-6">
      {qs.map((q, i) => (
        <div key={q} className="flex items-center gap-3" style={st({ animation: "fade-up .6s var(--ease-out-expo) both", animationDelay: `${i * 0.28}s` })}>
          <span className="grid size-6 place-items-center rounded-full border border-[color:var(--c)]/60 font-mono text-[10px] text-[color:var(--c)]">Q{i + 1}</span>
          <span className="relative h-8 flex-1 overflow-hidden rounded-full border border-white/10 bg-white/[0.03]">
            <i className="absolute inset-y-0 left-0 rounded-full bg-[color:var(--c)]/20" style={st({ width: `${58 + ((i * 17) % 38)}%`, transformOrigin: "left", animation: "grow-x .7s var(--ease-out-expo) both", animationDelay: `${i * 0.28 + 0.1}s` })} />
            <span className="relative flex h-full items-center px-3.5 text-[12px] text-fg/80">{q}</span>
          </span>
          <span className="text-[13px] text-[color:var(--c)]" style={st({ animation: "pop .5s both", animationDelay: `${i * 0.28 + 0.5}s` })}>✓</span>
        </div>
      ))}
      <div className="mt-2 rounded-2xl border border-[color:var(--c)]/50 bg-[color:var(--c)]/10 px-4 py-3 text-[12.5px] text-fg" style={st({ animation: "fade-up .7s var(--ease-out-expo) both", animationDelay: "1.7s", boxShadow: "0 0 40px -10px var(--c)" })}>
        <span className="font-mono text-[10px] tracking-[0.18em] text-[color:var(--c)] uppercase">→ decided</span>
        <div className="mt-1 text-fg/90">One sentence. No more questions.</div>
      </div>
    </div>
  );
}

/* 01 — the world metaphor */
function Concept() {
  return (
    <div className="relative grid h-full place-items-center overflow-hidden">
      {[210, 150, 96].map((s, i) => (
        <div key={s} className="orbit" style={st({ width: s, height: s, borderColor: "color-mix(in srgb, var(--c) 28%, transparent)", animation: `${i % 2 ? "spin-rev" : "spin"} ${9 + i * 5}s linear infinite`, "--oc": i === 1 ? "#fff" : "var(--c)" })}><i /></div>
      ))}
      <div className="relative size-[58px] rounded-full" style={{ background: "radial-gradient(circle at 32% 30%, #fff, var(--c) 35%, #05070d 100%)", boxShadow: "0 0 60px 8px color-mix(in srgb, var(--c) 55%, transparent)", animation: "bob 4s ease-in-out infinite" }} />
      <div className="absolute inset-x-5 bottom-4 flex items-center justify-between rounded-full border border-white/10 bg-black/50 px-4 py-2 font-mono text-[10px] tracking-[0.12em] text-dim uppercase backdrop-blur" style={st({ animation: "fade-up .7s both", animationDelay: ".9s" })}>
        <span>Authorship test</span><span className="text-[color:var(--c)]">✓ only we could ship this</span>
      </div>
    </div>
  );
}

/* 02 — chapters with scroll ranges and a hold */
function Storyboard() {
  const ch = [[0, 11], [11, 24], [24, 40], [40, 58], [58, 72], [72, 86], [86, 100]];
  return (
    <div className="flex h-full flex-col justify-center gap-5 p-6">
      <div className="relative h-24">
        {ch.map(([a, b], i) => (
          <div key={a} className="absolute bottom-0 flex flex-col justify-end overflow-hidden rounded-lg border border-[color:var(--c)]/40 p-1.5 font-mono text-[9px] text-[color:var(--c)]"
            style={st({ left: `${a}%`, width: `calc(${b - a}% - 4px)`, height: `${46 + ((i * 29) % 54)}%`, background: "linear-gradient(180deg, color-mix(in srgb, var(--c) 28%, transparent), color-mix(in srgb, var(--c) 6%, transparent))", transformOrigin: "bottom", animation: "pop .6s var(--ease-out-expo) both", animationDelay: `${i * 0.1}s` })}>CH{i + 1}</div>
        ))}
      </div>
      <div className="relative h-2 rounded-full bg-white/10">
        <i className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-[color:var(--c)]/60" style={{ animation: "grow-x 1.2s var(--ease-out-expo) both" }} />
        <i className="absolute -top-2 h-6 w-[2px] bg-white shadow-[0_0_14px_3px_var(--c)]" style={{ animation: "playhead 4.5s linear infinite" }} />
        <span className="absolute -top-6 font-mono text-[9px] tracking-[0.18em] text-fg/70 uppercase" style={{ left: "42%" }}>◆ hold</span>
      </div>
      <div className="grid grid-cols-3 gap-2 font-mono text-[9.5px] tracking-[0.1em] text-dim uppercase">
        {["Shot + lens", "Copy + type", "Transition"].map((t, i) => (
          <span key={t} className="rounded-lg border border-white/10 px-2 py-1.5 text-center" style={st({ animation: "fade-up .6s both", animationDelay: `${0.8 + i * 0.12}s` })}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* 03 — four asset routes under a 12 MB budget */
function Assets() {
  const rows: [string, number, string][] = [["Procedural", 4, "0 MB"], ["Generated 2.5D", 38, "3.1 MB"], ["GLB models", 62, "5.4 MB"], ["Frame sequence", 26, "2.2 MB"]];
  return (
    <div className="flex h-full flex-col justify-center gap-3.5 p-6">
      {rows.map(([n, w, mb], i) => (
        <div key={n}>
          <div className="mb-1.5 flex justify-between font-mono text-[10px] tracking-[0.12em] text-dim uppercase"><span>{n}</span><span className="text-fg/70">{mb}</span></div>
          <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
            <i className="block h-full origin-left rounded-full" style={st({ width: `${w}%`, background: "linear-gradient(90deg, color-mix(in srgb, var(--c) 40%, transparent), var(--c))", boxShadow: "0 0 18px var(--c)", animation: "grow-x 1s var(--ease-out-expo) both", animationDelay: `${i * 0.15}s` })} />
          </div>
        </div>
      ))}
      <div className="mt-1 flex items-center gap-3 rounded-2xl border border-dashed border-[color:var(--c)]/50 px-4 py-3" style={st({ animation: "fade-up .7s both", animationDelay: "1s" })}>
        <span className="font-display text-3xl font-semibold tracking-[-0.05em] text-[color:var(--c)]">12<small className="ml-1 text-[13px]">MB</small></span>
        <span className="text-[12px] leading-snug text-dim">hard budget. Every asset ships with its prompt.</span>
      </div>
    </div>
  );
}

/* 04 — scaffold, and a flat 60fps line */
function Scaffold() {
  const lines: [string, string][] = [["$ npm create aura@latest", "text-fg"], ["✓ engine, rail, post stack", "text-[color:var(--c)]"], ["✓ reference scene scrubbing", "text-[color:var(--c)]"], ["✓ adaptive quality: on", "text-[color:var(--c)]"]];
  return (
    <div className="flex h-full flex-col p-5">
      <div className="mb-3 flex gap-1.5">{["#ff6b6b", "#ffd28a", "#5cffc4"].map((c) => <i key={c} className="size-2.5 rounded-full" style={{ background: c, opacity: 0.8 }} />)}</div>
      <div className="flex-1 space-y-1.5 font-mono text-[12px]">
        {lines.map(([t, cls], i) => (<div key={t} className={cls} style={st({ animation: "fade-up .5s both", animationDelay: `${i * 0.45}s` })}>{t}</div>))}
        <div className="text-fg" style={st({ animation: "fade-up .5s both", animationDelay: "1.9s" })}>$ <span className="inline-block h-3.5 w-2 translate-y-0.5 bg-[color:var(--c)]" style={{ animation: "blink 1s steps(1) infinite" }} /></div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
        <div className="flex items-baseline justify-between font-mono text-[10px] tracking-[0.14em] text-dim uppercase"><span>Frame rate</span><b className="text-[15px] font-medium text-[color:var(--c)]">60 fps</b></div>
        <svg viewBox="0 0 300 40" className="mt-1 h-10 w-full" preserveAspectRatio="none">
          <path d="M0 12 L40 12 L60 11 L110 12 L160 12 L210 11 L260 12 L300 12" fill="none" stroke="var(--c)" strokeWidth="2" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1} style={{ animation: "draw 1.6s .6s ease-out forwards", filter: "drop-shadow(0 0 6px var(--c))" }} />
          <line x1="0" x2="300" y1="34" y2="34" stroke="rgba(255,255,255,.12)" strokeDasharray="3 4" />
        </svg>
      </div>
    </div>
  );
}

/* 05 — five depth planes, in 3D */
function World() {
  const planes: [string, string][] = [["Atmosphere", "#a58bff"], ["Background", "#6e9bff"], ["Mid", "#3de7ff"], ["Subject", "#ff9f7a"], ["Occluder", "#5cffc4"]];
  return (
    <div className="relative grid h-full place-items-center" style={{ perspective: 800 }}>
      <div className="relative h-[130px] w-[190px]" style={{ transformStyle: "preserve-3d", transform: "rotateX(58deg) rotateZ(-32deg) translateX(-30px)" }}>
        {planes.map(([n, c], i) => (
          <div key={n} className="absolute inset-0 rounded-2xl border" style={st({ borderColor: c, background: `linear-gradient(135deg, ${c}33, ${c}0d)`, boxShadow: `0 0 26px -6px ${c}`, transform: `translateZ(${i * 34}px)`, animation: `bob ${3.4 + i * 0.35}s ease-in-out ${i * 0.25}s infinite` })}>
            <i className="absolute left-3 top-2 size-1.5 rounded-full" style={{ background: c, boxShadow: `0 0 10px ${c}` }} />
          </div>
        ))}
      </div>
      <ul className="absolute right-4 top-1/2 -translate-y-1/2 space-y-1.5 font-mono text-[9.5px] tracking-[0.1em] uppercase">
        {[...planes].reverse().map(([n, c], i) => (<li key={n} className="flex items-center gap-2" style={st({ color: c, animation: "fade-up .5s both", animationDelay: `${0.3 + i * 0.12}s` })}><i className="size-1.5 rounded-full" style={{ background: c }} />{n}</li>))}
      </ul>
    </div>
  );
}

/* 06 — three polish passes */
function Polish() {
  const rings: [string, number, string][] = [["Motion", 118, "#ff7ad9"], ["Image", 86, "#ffd28a"], ["Detail", 54, "#5cffc4"]];
  return (
    <div className="relative grid h-full place-items-center">
      <svg viewBox="0 0 280 280" className="h-[88%] -rotate-90">
        {rings.map(([n, r, c], i) => (
          <g key={n}>
            <circle cx="140" cy="140" r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="12" />
            <circle cx="140" cy="140" r={r} fill="none" stroke={c} strokeWidth="12" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1} style={{ animation: `draw 1.1s ${0.2 + i * 0.5}s var(--ease-out-expo) forwards`, filter: `drop-shadow(0 0 7px ${c})` }} />
          </g>
        ))}
      </svg>
      <div className="absolute grid place-items-center text-center"><b className="font-display text-5xl font-semibold tracking-[-0.06em] text-fg">×3</b><span className="font-mono text-[9.5px] tracking-[0.16em] text-dim uppercase">passes logged</span></div>
      <ul className="absolute bottom-3 left-4 space-y-1 font-mono text-[9.5px] tracking-[0.12em] uppercase">
        {rings.map(([n, , c], i) => (<li key={n} className="flex items-center gap-2" style={st({ color: c, animation: "fade-up .5s both", animationDelay: `${0.4 + i * 0.5}s` })}><i className="size-1.5 rounded-full" style={{ background: c }} />{n}</li>))}
      </ul>
    </div>
  );
}

/* 07 — the gate: score and ship */
function Gate() {
  const score = useCount(87, 1700, 300);
  const R = 92;
  const arc = Math.PI * R;
  const done = score >= 85;
  return (
    <div className="relative flex h-full flex-col items-center justify-center">
      <svg viewBox="0 0 240 140" className="w-[78%] max-w-[300px]">
        <path d={`M ${120 - R} 124 A ${R} ${R} 0 0 1 ${120 + R} 124`} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="14" strokeLinecap="round" />
        <path d={`M ${120 - R} 124 A ${R} ${R} 0 0 1 ${120 + R} 124`} fill="none" stroke="url(#gate-g)" strokeWidth="14" strokeLinecap="round" strokeDasharray={arc} strokeDashoffset={arc * (1 - score / 100)} style={{ filter: "drop-shadow(0 0 8px var(--c))" }} />
        <defs><linearGradient id="gate-g" x1="0" x2="1"><stop offset="0" stopColor="#ffd28a" /><stop offset="1" stopColor="#b7ff7a" /></linearGradient></defs>
        {/* the 85 threshold tick */}
        <g transform={`rotate(${180 * 0.85 - 90} 120 124)`}><line x1="120" x2="120" y1={124 - R - 14} y2={124 - R + 14} stroke="#fff" strokeWidth="2" /></g>
      </svg>
      <div className="-mt-14 text-center">
        <b className="font-display text-6xl font-semibold tracking-[-0.06em] tabular-nums text-fg">{score}</b><span className="ml-1 font-mono text-[11px] text-dim">/ 100</span>
        <div className="font-mono text-[10px] tracking-[0.16em] text-dim uppercase">Aura Score · ship at ≥ 85</div>
      </div>
      <div className="mt-5 flex gap-2">
        {["Desktop", "Tablet", "Mobile"].map((v, i) => (<span key={v} className="rounded-full border border-white/10 px-3 py-1 font-mono text-[9.5px] tracking-[0.1em] text-dim uppercase" style={st({ animation: "fade-up .5s both", animationDelay: `${0.5 + i * 0.2}s` })}><span className="text-[color:var(--c)]">✓</span> {v}</span>))}
      </div>
      {done && <div className="absolute right-4 top-4 rounded-xl border-2 border-[color:var(--c)] px-3 py-1 font-display text-lg font-bold tracking-[0.12em] text-[color:var(--c)] uppercase" style={{ animation: "stamp .5s var(--ease-out-expo) both", boxShadow: "0 0 30px -4px var(--c)" }}>Ship it</div>}
    </div>
  );
}

const VISUALS = [Intake, Concept, Storyboard, Assets, Scaffold, World, Polish, Gate];
export function PhaseVisual({ index }: { index: number }) {
  const V = VISUALS[index] ?? Intake;
  return <V />;
}

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
function PipelineBody({ heading = true }: { heading?: boolean }) {
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
    const on = () => { if (!raf) raf = requestAnimationFrame(read); };
    read();
    addEventListener("scroll", on, { passive: true });
    addEventListener("resize", on);
    return () => { removeEventListener("scroll", on); removeEventListener("resize", on); if (raf) cancelAnimationFrame(raf); };
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

const PIPELINE_CSS = `
.orbit { position: absolute; border-radius: 50%; border: 1px dashed rgb(255 255 255 / 0.1); pointer-events: none; }
.orbit > i { position: absolute; top: -4px; left: 50%; width: 8px; height: 8px; margin-left: -4px; border-radius: 50%; background: var(--oc, #5cffc4); box-shadow: 0 0 16px 3px var(--oc, #5cffc4); }
/* ───────── pipeline ───────── */
@keyframes phase-in { from { opacity: 0; transform: translateY(18px); filter: blur(8px); } to { opacity: 1; transform: none; filter: none; } }
.phase-in > * { animation: phase-in 0.8s var(--ease-out-expo) both; animation-delay: calc(var(--i, 0) * 70ms); }
@keyframes pop { 0% { opacity: 0; transform: scale(0.4); } 60% { transform: scale(1.12); } 100% { opacity: 1; transform: scale(1); } }
@keyframes stamp { 0% { opacity: 0; transform: scale(2.4) rotate(-10deg); } 55% { opacity: 1; transform: scale(0.94) rotate(-4deg); } 100% { opacity: 1; transform: scale(1) rotate(-4deg); } }
@keyframes grow-x { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes draw { to { stroke-dashoffset: 0; } }
@keyframes playhead { from { left: 0; } to { left: 100%; } }
@keyframes bob { 0%, 100% { translate: 0 0; } 50% { translate: 0 -8px; } }
@keyframes pulse-ring { 0% { transform: scale(0.9); opacity: 0.8; } 100% { transform: scale(1.7); opacity: 0; } }
@keyframes blink { 50% { opacity: 0; } }
@keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

.pipe-card { --c: #5cffc4; position: relative; overflow: hidden; border-radius: 34px; border: 1px solid color-mix(in srgb, var(--c) 28%, rgb(255 255 255 / 0.08));
  background: linear-gradient(160deg, rgb(9 15 26 / 0.96), rgb(3 5 11 / 0.98));
  box-shadow: 0 50px 120px -50px color-mix(in srgb, var(--c) 55%, transparent), 0 1px 0 rgb(255 255 255 / 0.07) inset; transition: border-color 0.8s, box-shadow 0.8s; }
.pipe-card::before { content: ""; position: absolute; inset: 0; pointer-events: none; transition: background 0.8s;
  background: radial-gradient(70% 90% at 92% -10%, color-mix(in srgb, var(--c) 24%, transparent), transparent 65%), radial-gradient(40% 50% at 0% 100%, color-mix(in srgb, var(--c) 10%, transparent), transparent 70%); }
.pipe-card::after { content: ""; position: absolute; inset: 0; pointer-events: none; border-radius: inherit; opacity: 0.9;
  background: radial-gradient(420px circle at var(--mx, 70%) var(--my, 0%), rgb(255 255 255 / 0.07), transparent 60%); }
.ghost-num { position: absolute; right: -2%; bottom: -14%; font-family: var(--font-display); font-weight: 700; font-size: clamp(14rem, 26vw, 26rem); line-height: 1; letter-spacing: -0.08em; color: transparent;
  -webkit-text-stroke: 1.5px color-mix(in srgb, var(--c) 28%, transparent); pointer-events: none; user-select: none; opacity: 0.55; }
.viewport { position: relative; overflow: hidden; border-radius: 22px; border: 1px solid color-mix(in srgb, var(--c) 22%, rgb(255 255 255 / 0.06)); background: rgb(2 4 9 / 0.65);
  background-image: radial-gradient(color-mix(in srgb, var(--c) 18%, transparent) 1px, transparent 1.2px); background-size: 22px 22px; }
.rail-line { position: absolute; left: 19px; top: 20px; bottom: 20px; width: 2px; border-radius: 2px; background: rgb(255 255 255 / 0.08); }
.rail-fill { position: absolute; left: 0; top: 0; width: 100%; border-radius: 2px; background: linear-gradient(180deg, #5cffc4, #3de7ff, #a58bff, #ff7ad9, #ffd28a); transition: height 0.9s var(--ease-out-expo); box-shadow: 0 0 14px rgb(92 255 196 / 0.7); }
.rail-item { position: relative; display: flex; width: 100%; align-items: center; gap: 14px; border-radius: 16px; padding: 8px 10px 8px 0; text-align: left; transition: background 0.4s, transform 0.6s var(--ease-out-expo); }
.rail-node { position: relative; z-index: 1; display: grid; place-items: center; width: 40px; height: 40px; flex: none; border-radius: 50%; font: 500 11px var(--font-mono); letter-spacing: 0.04em;
  border: 1px solid rgb(255 255 255 / 0.14); background: #060a12; color: var(--color-dim); transition: all 0.6s var(--ease-out-expo); }
.rail-item[data-state="done"] .rail-node { border-color: color-mix(in srgb, var(--c) 70%, transparent); color: var(--c); }
.rail-item[data-state="on"] .rail-node { background: var(--c); color: #021510; border-color: var(--c); transform: scale(1.18); box-shadow: 0 0 0 6px color-mix(in srgb, var(--c) 18%, transparent), 0 0 30px color-mix(in srgb, var(--c) 70%, transparent); }
.rail-item[data-state="on"] { transform: translateX(6px); }
.rail-item:hover .rail-node { border-color: var(--c); }
`;


export function Pipeline(props: { heading?: boolean } = {}) {
  return (
    <>
      <style>{PIPELINE_CSS}</style>
      <PipelineBody {...props} />
    </>
  );
}
