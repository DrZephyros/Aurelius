"use client";

import { AuraExperience } from "./AuraExperience";
import { halo, haloAnchors } from "./scene.halo";
import type { AuraHandle } from "./engine";
import "./aura.css";

/* World #3 — a PRODUCT site. Chapter windows are locked to the shot list in scene.halo.ts:
   0–.12 reveal · .12–.28 macro · .28–.42 crane + open · .42–.6 EXPLODED ASCENT (projected labels) · .6–.7 settle · .7–.82 context · .82–.92 HERO HOLD · .92–1 final + CTA. */

const LABELS = [
  { id: "pcb", k: "01 — Signal", v: "48 dB", d: "Hybrid noise cancelling" },
  { id: "battery", k: "02 — Power", v: "30 h", d: "With the case, one charge" },
  { id: "driver", k: "03 — Sound", v: "11 mm", d: "Graphene-coated driver" },
] as const;

/** Projects the live 3D anchors to the screen each frame and positions the leader-line labels (no layout thrash: transform only). */
function trackLabels(h: AuraHandle) {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-anchor]"));
  h.onFrame((f) => {
    const host = els[0]?.offsetParent as HTMLElement | null;
    const W = host?.clientWidth ?? innerWidth, H = host?.clientHeight ?? innerHeight;
    for (const el of els) {
      const a = haloAnchors[el.dataset.anchor as "battery" | "pcb" | "driver"];
      const v = a.clone().project(f.camera);
      const behind = v.z > 1;
      el.style.transform = `translate(${(v.x * 0.5 + 0.5) * W}px, ${(-v.y * 0.5 + 0.5) * H}px)`;
      el.style.opacity = behind ? "0" : String(haloAnchors.k);
    }
  });
}

export default function HaloExperience({ scrollVh = 1000 }: { scrollVh?: number }) {
  return (
    <AuraExperience build={halo} scrollVh={scrollVh} title="NOCTA" onReady={trackLabels}>
      <div className="aura-giant" data-fit="0.9" data-a="0" data-b="0.16" data-fade="0.05" aria-hidden>NOCTA</div>
      <div className="aura-copy aura-left" data-a="0" data-b="0.12">
        <span className="aura-eyebrow">Active noise cancelling · 2026</span>
        <h2 className="aura-h">Silence,<br />engineered.</h2>
      </div>
      <div className="aura-copy aura-right" data-a="0.14" data-b="0.27">
        <span className="aura-eyebrow">Finish</span>
        <h2 className="aura-h">Lacquer, polished<br />fourteen times.</h2>
      </div>

      {LABELS.map((l, i) => {
        const dx = i === 1 ? -150 : 130, dy = i === 0 ? -90 : 80;
        return (
          <div key={l.id} className="halo-anchor" data-anchor={l.id} data-a="0.42" data-b="0.62" data-fade="0.04" style={{ position: "absolute", left: 0, top: 0, willChange: "transform,opacity" }}>
            <i className="halo-line" style={{ width: Math.hypot(dx, dy), transform: `rotate(${Math.atan2(dy, dx)}rad)` }} />
            <div className="halo-label" style={{ transform: `translate(${dx}px, ${dy}px) translate(${i === 1 ? "-100%" : "0"}, -50%)`, textAlign: i === 1 ? "right" : "left" }}>
              <span className="aura-eyebrow">{l.k}</span>
              <b>{l.v}</b>
              <small>{l.d}</small>
            </div>
          </div>
        );
      })}

      <div className="aura-copy aura-left" data-a="0.7" data-b="0.8">
        <span className="aura-eyebrow">Chapter 04</span>
        <h2 className="aura-h">Made for<br />the quiet hours.</h2>
      </div>
      <div className="aura-copy aura-right" data-a="0.83" data-b="0.92">
        <h2 className="aura-h">30 hours.<br />One charge.</h2>
      </div>
      <div className="aura-copy aura-center aura-hit" data-a="0.93" data-b="1" data-fade="0.04" style={{ top: "auto", bottom: "8vh", translate: "-50% 0" }}>
        <a className="aura-cta" href="#preorder">Pre-order — ships March</a>
      </div>

      <style>{`
        .halo-label { position: absolute; left: 0; top: 0; min-width: 190px; padding: 0 12px; }
        .halo-line { position: absolute; left: 0; top: 0; height: 1px; transform-origin: 0 0; background: linear-gradient(90deg, var(--aura-accent), rgb(125 255 217 / 0.15)); }
        .halo-label b { display: block; font: 600 clamp(1.8rem, 3.4vw, 3rem)/1 var(--aura-display); letter-spacing: -0.04em; margin-top: 10px; }
        .halo-label small { display: block; margin-top: 6px; font: 500 11px/1.4 var(--aura-mono); letter-spacing: 0.14em; text-transform: uppercase; color: var(--aura-dim); }
        .halo-anchor::after { content: ""; position: absolute; left: -4px; top: -4px; width: 8px; height: 8px; border-radius: 50%; background: var(--aura-accent); box-shadow: 0 0 14px var(--aura-accent); }
        :root { --aura-accent: #7dffd9; }
        @media (max-width: 760px) { .halo-label { min-width: 130px; } .halo-label small { display: none; } }
      `}</style>
    </AuraExperience>
  );
}
