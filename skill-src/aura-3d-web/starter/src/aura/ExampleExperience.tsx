"use client";

import { AuraExperience } from "./AuraExperience";
import { obsidianGate } from "./scene.example";
import "./aura.css";

/* The reference page: one scene + five chapters whose [data-a, data-b] windows line up with the shot list in scene.example.ts.
   Copy this file, rename the chapters, swap the scene. That is the whole integration. */
export default function ExampleExperience({ scrollVh = 720 }: { scrollVh?: number }) {
  return (
    <AuraExperience build={obsidianGate} scrollVh={scrollVh} scrollVhMobile={620} title="Obsidian Gate">
      {/* shot 1 · establish (0 → 0.2): giant type, almost no copy */}
      <div className="aura-giant" data-fit="0.86" data-a="0" data-b="0.2" data-fade="0.05" aria-hidden>OBSIDIAN</div>
      <div className="aura-copy aura-left" data-a="0" data-b="0.19">
        <span className="aura-eyebrow">Chapter 01 · Arrival</span>
        <h2 className="aura-h">Some places<br />you have to fall into.</h2>
      </div>

      {/* shot 2 · push-in (0.2 → 0.4) */}
      <div className="aura-copy aura-right" data-a="0.22" data-b="0.4">
        <span className="aura-eyebrow">Chapter 02 · Approach</span>
        <h2 className="aura-h">Closer.</h2>
        <p className="aura-p">The camera never cuts. Every scroll tick moves one lens through one world.</p>
      </div>

      {/* shot 3+hold · macro (0.4 → 0.6) */}
      <div className="aura-copy aura-left" data-a="0.43" data-b="0.62">
        <span className="aura-eyebrow">Chapter 03 · Detail</span>
        <h2 className="aura-h">Matter, lit<br />like it matters.</h2>
        <p className="aura-p">Telephoto lens, thin-film iridescence, a warm practical light that breathes.</p>
      </div>

      {/* shot 4 · crane (0.62 → 0.8) */}
      <div className="aura-copy aura-center" data-a="0.64" data-b="0.84">
        <span className="aura-eyebrow">Chapter 04 · Scale</span>
        <h2 className="aura-h" style={{ fontSize: "clamp(2.4rem,7vw,6.5rem)" }}>Now see<br />all of it.</h2>
      </div>

      {/* shot 5 · FINAL IMAGE (0.88 → 1): stays on screen, one CTA */}
      <div className="aura-copy aura-final aura-hit" data-a="0.88" data-b="1" data-fade="0.05">
        <h2 className="aura-h" style={{ fontSize: "clamp(2.4rem,6vw,5.5rem)" }}>Make yours.</h2>
        <a className="aura-cta" href="#start">Start a build</a>
      </div>
    </AuraExperience>
  );
}
