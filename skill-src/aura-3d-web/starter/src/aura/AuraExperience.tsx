"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { mountAura, type Builder, type AuraHandle } from "./engine";
import { bindDom, trackProgress } from "./choreo";

/* ─────────────────────────────────────────────────────────────
   AURA · AuraExperience — drop-in React shell.

   <AuraExperience build={myScene} scrollVh={700} title="ARDMERE">
     <div className="aura-copy" data-a="0.05" data-b="0.30">…chapter 1…</div>
     <div className="aura-copy" data-a="0.35" data-b="0.60">…chapter 2…</div>
   </AuraExperience>

   · A tall section (scrollVh) provides the scroll distance; a sticky stage holds the canvas.
     (Sticky, not fixed → you can embed the experience anywhere in a normal page.)
   · Children are the DOM overlay. Elements with data-a / data-b are choreographed from the SAME damped playhead as the camera.
   · Includes: preloader (tracks real asset loading), WebGL-failure fallback, reduced-motion handling, progress HUD.
   ───────────────────────────────────────────────────────────── */

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export interface AuraExperienceProps {
  build: Builder;
  children?: ReactNode;
  /** scroll distance of the whole experience, in viewport heights. 500 = short film · 800–1200 = feature */
  scrollVh?: number;
  title?: string;
  /** shown if WebGL is unavailable or fails — a designed still, never a blank page */
  poster?: string;
  hud?: boolean;
  className?: string;
  onReady?: (h: AuraHandle) => void;
}

export function AuraExperience({ build, children, scrollVh = 700, title = "", poster, hud = true, className = "", onReady }: AuraExperienceProps) {
  const track = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [pct, setPct] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hasWebGL()) { setFailed(true); return; }
    const t = track.current!, hostEl = host.current!, ov = overlay.current!;
    let handle: AuraHandle | null = null, dead = false;
    const t0 = performance.now();
    THREE.DefaultLoadingManager.onProgress = (_u, l, n) => setPct(n ? l / n : 1);
    const update = bindDom(ov);
    mountAura(hostEl, build, { progress: trackProgress(t) })
      .then((h) => {
        if (dead) { h.dispose(); return; }
        handle = h;
        h.onFrame((f) => {
          update(f.p);
          if (bar.current) bar.current.style.transform = `scaleX(${f.p})`;
        });
        onReady?.(h);
        // never flash: keep the loader up for at least 900ms so the entrance is a moment, not a pop
        setTimeout(() => !dead && setReady(true), Math.max(0, 900 - (performance.now() - t0)));
      })
      .catch(() => !dead && setFailed(true));
    return () => { dead = true; handle?.dispose(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={track} className={`aura-root ${className}`} style={{ height: `${scrollVh}vh` }} aria-label={title || "Immersive experience"}>
      <div className="aura-stage">
        <div ref={host} className="aura-canvas" aria-hidden />
        {failed && poster && <img src={poster} alt="" className="aura-poster" />}
        <div ref={overlay} className="aura-overlay">{children}</div>
        {hud && (
          <div className="aura-hud" aria-hidden>
            <span className="aura-hud-title">{title}</span>
            <span className="aura-hud-line"><span ref={bar} className="aura-hud-fill" /></span>
            <span className="aura-hud-hint">Scroll</span>
          </div>
        )}
        <div className={`aura-loader ${ready || failed ? "is-done" : ""}`} aria-hidden={ready}>
          <span className="aura-loader-n">{String(Math.round(pct * 100)).padStart(3, "0")}</span>
          <span className="aura-loader-t">{title}</span>
        </div>
      </div>
    </section>
  );
}
