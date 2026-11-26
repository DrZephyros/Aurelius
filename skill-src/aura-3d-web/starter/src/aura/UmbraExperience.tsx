"use client";

import { AuraExperience } from "./AuraExperience";
import { umbra } from "./scene.umbra";
import "./aura.css";

/* World #2 — an EVENT site. Chapter windows are locked to the shot list in scene.umbra.ts:
   0–.2 establish · .2–.4 walk · .4–.56 hero + HOLD · .56–.76 pass · .76–.9 crane · .9–1 final frame (stays on screen, CTA live). */
export default function UmbraExperience({ scrollVh = 900 }: { scrollVh?: number }) {
  return (
    <AuraExperience build={umbra} scrollVh={scrollVh} title="Umbra">
      <div className="aura-giant" data-fit="0.86" data-a="0" data-b="0.2" data-fade="0.05" aria-hidden>UMBRA</div>
      <div className="aura-copy aura-left" data-a="0" data-b="0.19">
        <span className="aura-eyebrow">21 · 08 · Mojave</span>
        <h2 className="aura-h">The day the desert<br />goes quiet.</h2>
      </div>

      <div className="aura-copy aura-right" data-a="0.22" data-b="0.38">
        <span className="aura-eyebrow">Chapter 02 · The walk</span>
        <h2 className="aura-h">Walk toward<br />the dark.</h2>
      </div>

      <div className="aura-copy aura-left" data-a="0.43" data-b="0.6">
        <span className="aura-eyebrow">Chapter 03 · Totality</span>
        <h2 className="aura-h">Four minutes.<br />No sun. No signal.</h2>
        <p className="aura-p">One monolith, three thousand people, a single shared silence.</p>
      </div>

      <div className="aura-copy aura-right" data-a="0.64" data-b="0.84">
        <span className="aura-eyebrow">Chapter 04 · The ring</span>
        <h2 className="aura-h">Light comes back<br />at the edge.</h2>
      </div>

      <div className="aura-copy aura-center aura-hit" data-a="0.9" data-b="1" data-fade="0.05" style={{ top: "auto", bottom: "9vh", translate: "-50% 0" }}>
        <h2 className="aura-h" style={{ fontSize: "clamp(2.4rem,6vw,5.5rem)" }}>Be there.</h2>
        <a className="aura-cta" href="#reserve">Reserve a place</a>
      </div>
    </AuraExperience>
  );
}
