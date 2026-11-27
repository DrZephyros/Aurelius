"use client";

import { useMemo } from "react";
import { AuraExperience } from "./AuraExperience";
import { meridian } from "./scene.meridian";
import { createScore } from "./frontier/audio";
import { LOOKS } from "./looks";
import "./aura.css";

/* World #5 — MERIDIAN, a LIGHT-mode world on the frontier modules (SDF hero · GPU particles · Gaussian splats · AO + bokeh · live probe · audio).
   Chapter windows are locked to the rail in scene.meridian.ts:
   0–.13 establish · .15–.27 liquid→droplets · .31–.43 scatter · .58–.8 captured (HOLD .66–.8) · .91–1 final image (CTA stays). */
export default function MeridianExperience({ scrollVh = 900 }: { scrollVh?: number }) {
  const score = useMemo(() => createScore({ root: 55, chords: [[0, 7, 12, 16], [0, 7, 12, 15], [-2, 5, 10, 14], [0, 5, 12, 17], [0, 7, 12, 16]], at: [0, 0.14, 0.3, 0.55, 0.88] }), []);
  return (
    <AuraExperience build={meridian} scrollVh={scrollVh} scrollVhMobile={620} title="Meridian" look={LOOKS.bone} score={score}>
      <div className="aura-giant" data-fit="0.84" data-a="0" data-b="0.14" data-fade="0.05" aria-hidden style={{ ["--aura-giant-top" as string]: "20%" }}>MERIDIAN</div>
      <div className="aura-copy aura-left" data-a="0" data-b="0.13">
        <span className="aura-eyebrow">A study in form</span>
        <h2 className="aura-h">Matter, in<br />four states.</h2>
      </div>

      <div className="aura-copy aura-right" data-a="0.15" data-b="0.27">
        <span className="aura-eyebrow">01 · Liquid</span>
        <h2 className="aura-h">One drop<br />remembers all.</h2>
        <p className="aura-p">A ray-marched metaball. It fuses, splits and pours — shapes no mesh can make.</p>
      </div>

      <div className="aura-copy aura-left" data-a="0.31" data-b="0.43">
        <span className="aura-eyebrow">02 · Scatter</span>
        <h2 className="aura-h">Thousands,<br />one current.</h2>
        <p className="aura-p">Particles integrated on the GPU, steered by the scroll.</p>
      </div>

      <div className="aura-copy aura-left" data-a="0.58" data-b="0.8">
        <span className="aura-eyebrow">03 · Captured</span>
        <h2 className="aura-h">A knot of<br />ninety thousand<br />soft points.</h2>
        <p className="aura-p">Gaussian splats: a scan that keeps its light.</p>
      </div>

      <div className="aura-copy aura-final aura-hit" data-a="0.91" data-b="1" data-fade="0.05">
        <h2 className="aura-h" style={{ fontSize: "clamp(2.4rem,6vw,5.2rem)" }}>Hold the form.</h2>
        <a className="aura-cta" href="#begin">Begin a project</a>
      </div>
    </AuraExperience>
  );
}
