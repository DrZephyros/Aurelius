"use client";

import { useEffect } from "react";
import { Link, usePath } from "@/lib/router";
import { SkillStudio } from "@/components/skill-studio";
import { setDockOpen, useDockOpen } from "@/lib/studio";

/** Site-wide Skill Studio: a launcher pill on every page + a drawer, so the skill is one keystroke (⌘J / Ctrl+J) away from anywhere. */
export function SkillDock() {
  const open = useDockOpen();
  const path = usePath();
  const onSkillPage = path === "/services";

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setDockOpen(!open);
      } else if (e.key === "Escape" && open) setDockOpen(false);
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => void (document.body.style.overflow = prev);
  }, [open]);

  useEffect(() => setDockOpen(false), [path]);

  return (
    <>
      {!open && !onSkillPage && (
        <button
          type="button"
          onClick={() => setDockOpen(true)}
          aria-label="Open the Skill Studio"
          className="group fixed right-4 bottom-4 z-[60] flex items-center gap-2.5 rounded-full border border-[rgb(92_255_196/0.35)] bg-[rgb(6_10_18/0.82)] py-2.5 pr-4 pl-3.5 text-[13px] font-medium text-fg shadow-[0_10px_40px_-8px_rgb(92_255_196/0.35)] backdrop-blur-xl transition hover:border-[rgb(92_255_196/0.8)] hover:shadow-[0_10px_50px_-4px_rgb(92_255_196/0.55)] sm:right-6 sm:bottom-6"
        >
          <span className="grid size-6 place-items-center rounded-full bg-aurora text-[12px] text-black transition group-hover:rotate-90">✦</span>
          Make your own
          <kbd className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-dim sm:inline">⌘J</kbd>
        </button>
      )}

      <div className={`fixed inset-0 z-[90] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <div onClick={() => setDockOpen(false)} className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`} />
        <aside
          role="dialog"
          aria-label="Skill Studio"
          className={`absolute inset-y-0 right-0 flex w-[min(1080px,100vw)] flex-col border-l border-line bg-[rgb(5_8_14/0.97)] shadow-[-30px_0_80px_-20px_rgb(0_0_0/0.8)] transition-transform duration-[650ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-8">
            <div>
              <div className="eyebrow">Skill Studio · AURA</div>
              <h2 className="mt-1 font-display text-xl font-semibold tracking-[-0.02em]">Brief it. Paste it. Get a film.</h2>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/services#skill" className="btn btn-ghost !h-9 !px-4 !text-[12px]">Full skill page →</Link>
              <button type="button" onClick={() => setDockOpen(false)} aria-label="Close" className="grid size-9 place-items-center rounded-full border border-line text-dim transition hover:text-fg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>
              </button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">{open && <SkillStudio />}</div>
        </aside>
      </div>
    </>
  );
}
