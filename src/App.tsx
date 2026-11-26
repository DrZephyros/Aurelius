import { useEffect } from "react";
import { Router, usePath, Link, navigate } from "@/lib/router";
import { SiteNav, SiteFooter } from "@/components/chrome";
import { LibraryDock } from "@/components/library-filter";
import { AuroraScene } from "@/components/aurora-scene";
import Home from "@/views/Home";
import LibraryPage from "@/views/LibraryPage";
import TemplatePage from "@/views/TemplatePage";
import DemoPage from "@/views/DemoPage";
import PromptsPage from "@/views/PromptsPage";
import { CheckoutPage, DownloadPage } from "@/views/SkillCheckout";
import ServicesPage from "@/views/ServicesPage";
import BundlesIndex from "@/bundles/BundlesIndex";
import BundleShell from "@/bundles/BundleShell";
import { ComponentsHub, CategoryView, ItemView } from "@/views/RegistryViews";
import { REG_CATS, TEXT_EFFECTS, catBySlug, getItem } from "@/lib/registry";
import { readItem } from "@/lib/registry-files";

function NotFound() {
  return (
    <main className="mx-auto max-w-[1320px] px-5 pb-28 pt-40 sm:px-8">
      <h1 className="h-display text-[clamp(3rem,8vw,6rem)]">Not found</h1>
      <Link href="/" className="btn btn-primary mt-8">Back home</Link>
    </main>
  );
}

function Item({ category, slug }: { category: string; slug: string }) {
  const item = getItem(category, slug);
  if (!item) return <NotFound />;
  const { code, readme, body } = readItem(category, slug);
  return <ItemView item={item} code={code} readme={readme} body={body} />;
}

/** Old URLs (/skill, /request) now live inside Services — keep them working. */
function Redirect({ to }: { to: string }) {
  useEffect(() => {
    history.replaceState({}, "", "/");
    navigate(to);
  }, [to]);
  return null;
}

function Routes() {
  const path = usePath().replace(/\/+$/, "") || "/";
  let m = path.match(/^\/templates\/([\w-]+)$/);
  if (m) return <TemplatePage key={m[1]} slug={m[1]} />;
  m = path.match(/^\/pages\/([\w-]+)$/);
  if (m) return <DemoPage key={"p" + m[1]} kind="page" slug={m[1]} />;
  m = path.match(/^\/elements\/([\w-]+)$/);
  if (m) return <DemoPage key={"e" + m[1]} kind="element" slug={m[1]} />;
  m = path.match(/^\/text-effects\/([\w-]+)$/);
  if (m) return <Item key={"t" + m[1]} category={TEXT_EFFECTS} slug={m[1]} />;
  m = path.match(/^\/components\/([\w-]+)\/([\w-]+)$/);
  if (m) return <Item key={m[1] + m[2]} category={m[1]} slug={m[2]} />;
  m = path.match(/^\/components\/([\w-]+)$/);
  if (m) return catBySlug(m[1]) && REG_CATS.some((c) => c.slug === m![1]) ? <CategoryView key={m[1]} category={m[1]} /> : <NotFound />;
  if (path === "/components") return <ComponentsHub />;
  if (path === "/text-effects") return <CategoryView key="te" category={TEXT_EFFECTS} />;
  if (path === "/library") return <LibraryPage key="all" shelf="all" />;
  if (path === "/landing-pages") return <LibraryPage key="worlds" shelf="worlds" />;
  if (path === "/pages") return <LibraryPage key="pages" shelf="pages" />;
  if (path === "/elements") return <LibraryPage key="elements" shelf="elements" />;
  if (path === "/bundles") return <BundlesIndex />;
  if (path === "/prompts") return <PromptsPage />;
  if (path === "/services") return <ServicesPage />;
  if (path === "/skill" || path === "/make-your-own") return <Redirect to="/services#skill" />;
  if (path === "/request") return <Redirect to="/services#build" />;
  if (path === "/skill/checkout") return <CheckoutPage />;
  if (path === "/skill/download") return <DownloadPage />;
  if (path === "/") return <Home />;
  return <NotFound />;
}

function Shell() {
  const path = usePath().replace(/\/+$/, "") || "/";
  const home = path === "/";
  const bundle = path.match(/^\/bundles\/([\w-]+)(?:\/([\w-]+))?$/);
  // a bundle owns the whole screen: its own world, its own nav, no site chrome
  if (bundle) {
    return (
      <>
        <BundleShell key={bundle[1]} slug={bundle[1]} page={bundle[2]} />
      </>
    );
  }
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-aurora focus:px-4 focus:py-2 focus:text-black">Skip to content</a>
      {/* the aurora world: the scroll-driven hero on Home, a light CSS sky everywhere else */}
      {home ? (
        <div className="fixed inset-0 z-0">
          <AuroraScene mode="journey" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_78%,rgb(3_5_11/0.62),transparent_70%)]" />
        </div>
      ) : (
        <div className="css-aurora"><i /><i /><i /></div>
      )}
      <SiteNav />
      <div id="main" className="relative z-10"><Routes /></div>
      <SiteFooter />
      <LibraryDock />
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
