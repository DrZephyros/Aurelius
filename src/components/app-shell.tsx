"use client";

import { useEffect, type ReactNode } from "react";
import { usePath } from "@/lib/router";
import { SiteNav, SiteFooter, LibraryTabs } from "@/components/chrome";
import { AuroraScene } from "@/components/aurora-scene";
import { CommandPalette } from "@/components/command-palette";

export function AppShell({ children }: { children: ReactNode }) {
  const path = usePath();
  const home = path === "/";

  /* one soft light follows the cursor across every .spot surface */
  useEffect(() => {
    const on = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(".spot") as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    addEventListener("pointermove", on, { passive: true });
    return () => removeEventListener("pointermove", on);
  }, []);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-aurora focus:px-4 focus:py-2 focus:text-black">Skip to content</a>
      {/* the aurora world: the scroll-driven hero on Home, a calm drift on the Library, a light CSS sky everywhere else */}
      {home ? (
        <div className="fixed inset-0 z-0">
          <AuroraScene mode="journey" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_78%,rgb(3_5_11/0.62),transparent_70%)]" />
        </div>
      ) : (
        <div className="css-aurora"><i /><i /><i /></div>
      )}
      <SiteNav />
      {!home && <LibraryTabs />}
      <div id="main" className="relative z-10">{children}</div>
      <CommandPalette />
      <SiteFooter />
    </>
  );
}
