"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "@/lib/router";
import { bundleBySlug, PAGE_KEYS, type PageKey } from "./data";
import { mountWorld, type Builder, type World } from "./engine";
import { buildYoru } from "./scenes/yoru";
import { buildHelm } from "./scenes/helm";
import { buildAltai } from "./scenes/altai";
import { BundleLanding } from "./BundleLanding";
import { AccountPage, PricingPage, ReservePage, SignInPage } from "./BundlePages";
import "./bundle.css";

const SCENES: Record<string, Builder> = { yoru: buildYoru, helm: buildHelm, altai: buildAltai };

/** One bundle, full-screen. The WebGL world is mounted once per bundle and survives page changes,
 *  so moving between the landing and the pricing / sign-in / reserve / account pages glides the camera along its rail. */
export default function BundleShell({ slug, page }: { slug: string; page?: string }) {
  const b = bundleBySlug(slug);
  const host = useRef<HTMLDivElement>(null);
  const world = useRef<World | null>(null);
  const [ok, setOk] = useState(true);
  const [ready, setReady] = useState(false);
  // ?embed=scroll: the Showcase landing renders this bundle as a scroll-driven specimen (no chrome, the parent drives the scroll)
  const [embedded, setEmbedded] = useState(false);
  const key = PAGE_KEYS.includes(page as PageKey) ? (page as PageKey) : undefined;

  useEffect(() => {
    document.title = b ? `${b.name} — ${b.tagline}` : "Bundle not found";
    return () => { document.title = "Aurelius — 3D websites, components and text effects for vibecoders"; };
  }, [b]);

  useEffect(() => {
    setEmbedded(new URLSearchParams(location.search).get("embed") === "scroll");
  }, []);

  useEffect(() => {
    if (!b || !host.current) return;
    try {
      world.current = mountWorld(host.current, SCENES[b.slug]);
      setOk(true);
    } catch (e) {
      console.warn("WebGL unavailable", e);
      setOk(false);
    }
    setReady(true);
    return () => { world.current?.dispose(); world.current = null; setReady(false); };
  }, [b]);

  // sub-pages park the camera at their own pose; the world keeps its brightness behind the UI
  useEffect(() => {
    if (!b || !ready || !key) return;
    world.current?.set({ target: b.pose[key], dim: 0 });
  }, [b, key, ready]);

  if (!b) {
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
        <div><h1 className="h-display text-[clamp(3rem,8vw,6rem)]">Bundle not found</h1><Link href="/bundles" className="btn btn-primary mt-8">All bundles</Link></div>
      </main>
    );
  }

  const t = b.theme;
  const vars = { "--b-accent": t.accent, "--b-accent2": t.accent2, "--b-bg": t.bg, "--b-fg": t.fg, "--b-muted": t.muted, "--b-card": t.card, "--b-display": t.display, "--b-r": `${t.radius}px` } as CSSProperties;
  const links = (
    <>
      <Link href={`/bundles/${b.slug}`} aria-current={!key ? "page" : undefined}>Experience</Link>
      {PAGE_KEYS.map((k) => <Link key={k} href={`/bundles/${b.slug}/${k}`} aria-current={key === k ? "page" : undefined}>{b.nav[k]}</Link>)}
    </>
  );

  return (
    <div className={embedded ? "bd bd-embed" : "bd"} style={vars}>
      <div className="bd-world" ref={host} aria-hidden>{!ok && <div className="bd-fallback">WebGL is unavailable — showing the static theme</div>}</div>
      <div className="bd-shade" style={{ opacity: key ? 0.3 : 0 }} aria-hidden />
      <div className="bd-curtain" aria-hidden><span>{b.wordmark}</span></div>

      <header className="bd-bar">
        <div className="bd-brand">
          <Link href="/bundles" className="bd-back" aria-label="Back to all bundles">← Bundles</Link>
          <Link href={`/bundles/${b.slug}`}>{b.wordmark}</Link>
        </div>
        <nav className="bd-links" aria-label={`${b.name} pages`}>{links}</nav>
        <Link href={`/bundles/${b.slug}/reserve`} className="bd-btn bd-btn-primary bd-btn-sm">{b.nav.reserve}</Link>
      </header>
      <nav className="bd-mnav" aria-label={`${b.name} pages`}>{links}</nav>

      <main id="bundle-main">
        {!key && ready && <BundleLanding b={b} world={world} embedded={embedded} />}
        {key && (
          <div key={key} style={{ animation: "bd-in .9s cubic-bezier(.16,1,.3,1) both" }}>
            {key === "pricing" && <PricingPage b={b} />}
            {key === "signin" && <SignInPage b={b} />}
            {key === "reserve" && <ReservePage b={b} />}
            {key === "account" && <AccountPage b={b} />}
          </div>
        )}
      </main>
    </div>
  );
}
