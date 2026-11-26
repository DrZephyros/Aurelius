"use client";

import { useEffect, useState, type CSSProperties } from "react";

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
