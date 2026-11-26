"use client";

import { AuraExperience } from "./AuraExperience";
import { folio, folioAt, PROJECTS } from "./scene.folio";
import "./aura.css";

/* World #4 — a FOLIO. One chapter per project, each locked to its HOLD in scene.folio.ts (folioAt(i) ± 0.05):
   0–.07 name + wide · six project chapters on alternating sides · .9–1 pull-back + CTA (stays on screen). */
export default function FolioExperience({ scrollVh = 1000 }: { scrollVh?: number }) {
  return (
    <AuraExperience build={folio} scrollVh={scrollVh} title="Mira — folio">
      <div className="aura-giant" data-fit="0.9" data-a="0" data-b="0.07" data-fade="0.03" aria-hidden>MIRA</div>
      <div className="aura-copy aura-left" data-a="0" data-b="0.07">
        <span className="aura-eyebrow">Independent design studio · 2026</span>
        <h2 className="aura-h">Work, in the order<br />it was made.</h2>
      </div>
      {PROJECTS.map((pr, i) => (
        <div key={pr.title} className={`aura-copy ${i % 2 ? "aura-right" : "aura-left"}`} data-a={(folioAt(i) - 0.045).toFixed(3)} data-b={(folioAt(i) + 0.045).toFixed(3)} data-fade="0.02" style={{ bottom: "9vh" }}>
          <span className="aura-eyebrow">{String(i + 1).padStart(2, "0")} / 06 · {pr.kind}</span>
          <h2 className="aura-h">{pr.title}</h2>
        </div>
      ))}
      <div className="aura-copy aura-center aura-hit" data-a="0.94" data-b="1" data-fade="0.04" style={{ top: "auto", bottom: "9vh", translate: "-50% 0" }}>
        <h2 className="aura-h" style={{ fontSize: "clamp(2.2rem,5.5vw,5rem)" }}>Your project next.</h2>
        <a className="aura-cta" href="#contact">Start a conversation</a>
      </div>
    </AuraExperience>
  );
}
