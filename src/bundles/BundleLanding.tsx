"use client";

import { useEffect, useRef, type CSSProperties, type MutableRefObject } from "react";
import { Link } from "@/lib/router";
import type { Bundle, PageKey } from "./data";
import type { World } from "./engine";
import { bearingName, helmHeading } from "./scenes/helm";
import { smooth } from "./scenes/util";

/* The scroll-driven landing page: a tall invisible track, a fixed HUD, and HTML chapters that
   fade in and out in lock-step with the *camera's* damped playhead (not the raw scroll),
   so the type and the 3D world always feel like one shot. All per-frame work is direct DOM writes. */

const pad = (n: number, l = 3) => String(Math.max(0, Math.round(n))).padStart(l, "0");
function readout(slug: string, p: number): [string, string] {
  if (slug === "yoru") return ["Step", `${pad(p * 112)} / 112`];
  if (slug === "helm") { const h = helmHeading(p); return ["Heading", `${pad(h % 360)}° ${bearingName(h)}`]; }
  return ["Altitude", `${Math.round(1850 + 2656 * smooth(0, 1, p)).toLocaleString("en-US")} m`];
}
const PAGES: PageKey[] = ["pricing", "signin", "reserve", "account"];

export function BundleLanding({ b, world }: { b: Bundle; world: MutableRefObject<World | null> }) {
  const M = b.chapters.length + 1;
  const hero = useRef<HTMLElement>(null);
  const chaps = useRef<(HTMLElement | null)[]>([]);
  const dots = useRef<(HTMLButtonElement | null)[]>([]);
  const count = useRef<HTMLDivElement>(null);
  const read = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const prog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const max = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const onScroll = () => world.current?.set({ target: scrollY / max(), dim: 0 });
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);

    let raf = 0, lastIdx = -1, lastRead = "";
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const p = world.current ? world.current.progress() : scrollY / max();
      const raw = scrollY / max();
      if (prog.current) prog.current.style.transform = `scaleX(${raw})`;

      const h = hero.current;
      if (h) {
        const d = p * (M - 1);
        const a = 1 - smooth(0.04, 0.6, d);
        h.style.opacity = String(a);
        h.style.transform = `translate3d(0,${-d * 70}px,0) scale(${1 + d * 0.55})`;
        h.style.filter = d > 0.02 ? `blur(${d * 14}px)` : "none";
        h.style.pointerEvents = a > 0.5 ? "auto" : "none";
      }
      chaps.current.forEach((el, k) => {
        if (!el) return;
        const i = k + 1, c = i / (M - 1), d = (p - c) * (M - 1), ad = Math.abs(d);
        const last = i === M - 1;
        const a = last && d > 0 ? 1 : 1 - smooth(0.24, 0.66, ad);
        el.style.opacity = String(a);
        el.style.transform = `translate3d(0,${(last && d > 0 ? 0 : -d) * 110}px,0)`;
        el.style.filter = a < 0.98 ? `blur(${(1 - a) * 9}px)` : "none";
        el.style.visibility = a < 0.01 ? "hidden" : "visible";
        el.style.pointerEvents = a > 0.5 ? "auto" : "none";
      });

      const idx = Math.min(M - 1, Math.round(p * (M - 1)));
      if (idx !== lastIdx) {
        lastIdx = idx;
        dots.current.forEach((d, i) => d?.classList.toggle("on", i === idx));
        if (count.current) count.current.innerHTML = `<b>${pad(idx + 1, 2)}</b> / ${pad(M, 2)} <span>${idx === 0 ? b.name : b.chapters[idx - 1].kicker.split("— ")[1] ?? ""}</span>`;
      }
      const [lbl, val] = readout(b.slug, p);
      const key = lbl + val;
      if (read.current && key !== lastRead) { lastRead = key; read.current.innerHTML = `${lbl}<b>${val}</b>`; }
      if (hint.current) hint.current.style.opacity = raw > 0.015 ? "0" : "1";
    };
    loop();
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", onScroll); removeEventListener("resize", onScroll); };
  }, [b, M, world]);

  const goto = (i: number) => scrollTo({ top: (i / (M - 1)) * (document.documentElement.scrollHeight - innerHeight), behavior: "smooth" });

  return (
    <>
      <div style={{ height: `${M * 130}vh` }} aria-hidden />
      <div className="bd-progress" ref={prog} aria-hidden />

      <div className="bd-stage">
        <section ref={hero} className="bd-hero" aria-label={b.name}>
          <div className="bd-hero-kick">{b.hero.kicker}</div>
          <h1 className={`bd-title ${b.wordmark.length > 6 ? "long" : ""}`}>{b.wordmark}</h1>
          <p className="bd-hero-sub">{b.hero.sub}</p>
          <div className="bd-hero-cta">
            <button type="button" className="bd-btn bd-btn-primary" onClick={() => goto(1)}>{b.hero.cta} ↓</button>
            <Link href={`/bundles/${b.slug}/reserve`} className="bd-btn bd-btn-ghost">{b.nav.reserve}</Link>
          </div>
        </section>

        {b.chapters.map((c, k) => {
          const last = k === b.chapters.length - 1;
          return (
            <section key={c.title} ref={(el) => { chaps.current[k] = el; }} className="bd-chap" data-side={c.side ?? "left"} style={{ visibility: "hidden", opacity: 0 }}>
              <div className="bd-chap-in">
                <span className="bd-ghost" aria-hidden>{pad(k + 1, 2)}</span>
                <div className="bd-eyebrow">{c.kicker}</div>
                <h2>{c.title}</h2>
                <p>{c.body}</p>
                {c.stat && <div className="bd-stat"><b>{c.stat[0]}</b><span>{c.stat[1]}</span></div>}
                {last && (
                  <>
                    <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", pointerEvents: "auto" }}>
                      <Link href={`/bundles/${b.slug}/reserve`} className="bd-btn bd-btn-primary">{b.nav.reserve} →</Link>
                      <Link href={`/bundles/${b.slug}/pricing`} className="bd-btn bd-btn-ghost">{b.nav.pricing}</Link>
                      <button type="button" className="bd-btn bd-btn-ghost" onClick={() => goto(0)}>↑ Replay</button>
                    </div>
                    <div className="bd-incl" aria-label="Pages in this bundle">
                      {PAGES.map((k2, n) => (
                        <Link key={k2} href={`/bundles/${b.slug}/${k2}`}><i>0{n + 1} — PAGE</i><b>{b.nav[k2]}</b></Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div className="bd-hud" style={{ "--n": M } as CSSProperties}>
        <div className="bd-dots" role="tablist" aria-label="Chapters">
          {Array.from({ length: M }, (_, i) => (
            <button key={i} ref={(el) => { dots.current[i] = el; }} type="button" aria-label={i === 0 ? "Intro" : b.chapters[i - 1].kicker} onClick={() => goto(i)}><i /></button>
          ))}
        </div>
        <div className="bd-count" ref={count} />
        <div className="bd-read" ref={read} />
        <div className="bd-hint" ref={hint}><span>{b.hero.hint}</span><i /></div>
      </div>
    </>
  );
}
