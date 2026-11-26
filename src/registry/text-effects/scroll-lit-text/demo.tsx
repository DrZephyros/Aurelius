"use client";

import { useEffect, useRef } from "react";
import { ScrollLitText } from "./scroll-lit-text";

/** The text sits inside a tall scroll area that glides on its own — so you see it work with zero effort.
 *  Grab the wheel / touch / drag the scrollbar at any time and you are in control; it resumes after a pause. */
export default function Demo() {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, last = performance.now(), idleUntil = 0, pos = 0, dir = 1;
    const hold = () => { idleUntil = performance.now() + 3200; };
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const max = el.scrollHeight - el.clientHeight;
      if (now < idleUntil) pos = max > 0 ? el.scrollTop / max : 0; // the user is driving — just follow
      else if (max > 0) {
        pos += dir * dt / (dir > 0 ? 6.5 : 2.2); // slow read forward, quick rewind
        if (pos > 1.18) dir = -1;   // the overshoot is a little pause at each end
        if (pos < -0.12) dir = 1;
        el.scrollTop = Math.min(1, Math.max(0, pos)) * max;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const evs = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    evs.forEach((e) => el.addEventListener(e, hold, { passive: true }));
    return () => { cancelAnimationFrame(raf); evs.forEach((e) => el.removeEventListener(e, hold)); };
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 700 }}>
      <style>{`.au-sl-demo{scrollbar-width:none}.au-sl-demo::-webkit-scrollbar{display:none}`}</style>
      <div
        ref={box}
        className="au-sl-demo"
        style={{ height: 400, overflowY: "auto", WebkitMaskImage: "linear-gradient(transparent, #000 14%, #000 86%, transparent)", maskImage: "linear-gradient(transparent, #000 14%, #000 86%, transparent)" }}
      >
        <div style={{ height: 330 }} />
        <ScrollLitText
          text="Great motion is *felt,* not noticed. Words ignite as you read, so the *story* moves at the speed of the reader — never faster, never slower."
          style={{ fontSize: "clamp(1.5rem,3.6vw,2.3rem)", fontWeight: 600, lineHeight: 1.18, letterSpacing: "-0.03em" }}
        />
        <div style={{ height: 330 }} />
      </div>
      <div style={{ fontSize: 11, opacity: 0.45, textAlign: "center", marginTop: 10, letterSpacing: "0.14em", textTransform: "uppercase" }}>plays itself · scroll in the frame to take over</div>
    </div>
  );
}
