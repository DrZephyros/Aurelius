"use client";

import { useEffect, useRef, useState } from "react";
import UmbraExperience from "../../skill-src/aura-3d-web/starter/src/aura/UmbraExperience";
import HaloExperience from "../../skill-src/aura-3d-web/starter/src/aura/HaloExperience";
import FolioExperience from "../../skill-src/aura-3d-web/starter/src/aura/FolioExperience";
import ExampleExperience from "../../skill-src/aura-3d-web/starter/src/aura/ExampleExperience";

export const WORLDS = [
  { id: "folio", t: "Mira · Folio", k: "Portfolio · six projects on a helix, plates ignite on hold", Comp: FolioExperience },
  { id: "halo", t: "NOCTA", k: "Product · altar, exploded ascent, studio light", Comp: HaloExperience },
  { id: "umbra", t: "Umbra", k: "Event · terrain, eclipse sky, light shafts", Comp: UmbraExperience },
  { id: "obsidian", t: "Obsidian Gate", k: "Object · crystal, rings, mirror floor", Comp: ExampleExperience },
] as const;

/** The REAL starter output, running live: scroll it. Boots only near the viewport and tears the WebGL context down when you leave. */
export function LiveWorld({ initial = "halo", scrollVh = 520, switcher = true }: { initial?: "umbra" | "obsidian" | "halo" | "folio"; scrollVh?: number; switcher?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [id, setId] = useState<string>(initial);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: "60% 0px 60% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const World = (WORLDS.find((w) => w.id === id) ?? WORLDS[0]).Comp;
  return (
    <div className="relative">
      {switcher && (
        <div className="pointer-events-none sticky top-[84px] z-30 flex justify-center">
          <div className="pointer-events-auto -mb-[52px] inline-flex rounded-full border border-line bg-[rgb(5_8_14/0.78)] p-1 text-[12px] backdrop-blur-xl">
            {WORLDS.map((w) => (
              <button key={w.id} type="button" onClick={() => setId(w.id)} aria-pressed={id === w.id} className={`rounded-full px-4 py-1.5 transition ${id === w.id ? "bg-white/14 text-fg" : "text-dim hover:text-fg"}`}>
                {w.t}
              </button>
            ))}
          </div>
        </div>
      )}
      <div ref={ref} style={{ minHeight: `${scrollVh}vh` }}>
        {on && <World key={id} scrollVh={scrollVh} />}
      </div>
    </div>
  );
}
