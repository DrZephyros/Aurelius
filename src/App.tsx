import { useEffect } from "react";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/space-grotesk/wght.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import { Router, usePath } from "@/lib/router";
import { SiteNav, SiteFooter, LibraryTabs } from "@/components/chrome";
import { AuroraScene } from "@/components/aurora-scene";
import LibraryPage from "@/pages/LibraryPage";
import Home from "@/pages/Home";
import TemplatePage from "@/pages/TemplatePage";
import PromptsPage from "@/pages/PromptsPage";
import ToolsPage from "@/pages/ToolsPage";
import DemoPage from "@/pages/DemoPage";
import { CommandPalette } from "@/components/command-palette";

function Routes() {
  const path = usePath();
  let m = path.match(/^\/templates\/([\w-]+)\/?$/);
  if (m) return <TemplatePage key={m[1]} slug={m[1]} />;
  m = path.match(/^\/pages\/([\w-]+)\/?$/);
  if (m) return <DemoPage key={"p" + m[1]} kind="page" slug={m[1]} />;
  m = path.match(/^\/elements\/([\w-]+)\/?$/);
  if (m) return <DemoPage key={"e" + m[1]} kind="element" slug={m[1]} />;
  if (path.startsWith("/library")) return <LibraryPage key="all" shelf="all" />;
  if (path.startsWith("/landing-pages")) return <LibraryPage key="worlds" shelf="worlds" />;
  if (path.startsWith("/pages")) return <LibraryPage key="pages" shelf="pages" />;
  if (path.startsWith("/elements")) return <LibraryPage key="elements" shelf="elements" />;
  if (path.startsWith("/prompts")) return <PromptsPage />;
  if (path.startsWith("/tools")) return <ToolsPage />;
  return <Home />;
}

function Shell() {
  const path = usePath();
  const home = path === "/";
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
      <div id="main" className="relative z-10"><Routes /></div>
      <CommandPalette />
      <SiteFooter />
    </>
  );
}

export default function App() {
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
    <Router>
      <Shell />
    </Router>
  );
}
