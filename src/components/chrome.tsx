"use client";

import { useEffect, useState } from "react";
import { Link, usePath } from "@/lib/router";
import { SITE } from "@/lib/site";

export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id="aur-lg" x1="2" y1="30" x2="30" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5cffc4" />
          <stop offset=".5" stopColor="#6fb4ff" />
          <stop offset="1" stopColor="#ffd28a" />
        </linearGradient>
      </defs>
      <path d="M4.5 27.5 16 3.5l11.5 24" stroke="url(#aur-lg)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.6 21.2c4.6-4.2 10.2-4.2 14.8 0" stroke="url(#aur-lg)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="16" cy="3.5" r="1.6" fill="#ffd28a" />
    </svg>
  );
}

/** The shelves of the library — shared by the nav, the hub, the tab bar and the footer. */
export const SHELVES: { label: string; href: string; hint: string }[] = [
  { label: "Bundles", href: "/bundles", hint: "Immersive 3D, one theme" },
  { label: "Landing pages", href: "/landing-pages", hint: "Cinematic 3D sites" },
  { label: "App pages", href: "/pages", hint: "Auth, billing, dashboards" },
  { label: "Components", href: "/components", hint: "Drop-in React pieces" },
  { label: "Text effects", href: "/text-effects", hint: "Import onto any text" },
  { label: "Elements", href: "/elements", hint: "Interactive demos" },
  { label: "Prompts", href: "/prompts", hint: "58 battle-tested prompts" },
];

const NAV: [string, string][] = [
  ["Bundles", "/bundles"],
  ["Library", "/library"],
  ["Landing pages", "/landing-pages"],
  ["Components", "/components"],
  ["Text effects", "/text-effects"],
  ["Prompts", "/prompts"],
];

export function SiteNav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [p, setP] = useState(0);
  const path = usePath();
  useEffect(() => {
    const on = () => {
      setSolid(window.scrollY > 40);
      const h = document.documentElement.scrollHeight - innerHeight;
      setP(h > 0 ? Math.min(1, window.scrollY / h) : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [path]);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => void (document.body.style.overflow = "");
  }, [open]);

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${solid || open ? "border-b border-line bg-bg/70 backdrop-blur-xl" : "border-b border-transparent"}`}>
        <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="group flex items-center gap-3 font-display text-[17px] font-semibold tracking-[0.02em]">
            <Logo />
            <span>
              {SITE.name}
              <span className="ml-2 hidden font-mono text-[10px] font-normal tracking-[0.24em] text-dim uppercase sm:inline">Project</span>
            </span>
          </Link>
          <nav className="glass hidden items-center gap-1 rounded-full p-1 lg:flex" aria-label="Main">
            {NAV.map(([l, h]) => {
              const on = h === "/library" ? path.startsWith("/library") : path.startsWith(h);
              return (
                <Link key={l} href={h} className={`rounded-full px-4 py-2 text-[13px] transition ${on ? "bg-white/12 text-fg" : "text-dim hover:bg-white/8 hover:text-fg"}`} aria-current={on ? "page" : undefined}>
                  {l}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("aurelius:palette"))}
              className="glass hidden h-[38px] items-center gap-2 rounded-full px-3.5 text-[13px] text-dim transition hover:text-fg sm:flex"
              aria-label="Search (Ctrl K)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              Search
              <kbd className="rounded border border-line px-1.5 font-mono text-[10px]">⌘K</kbd>
            </button>
            <Link href="/library" className="btn btn-primary btn-sm hidden sm:inline-flex">Enter the library</Link>
            <button type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="glass grid size-[38px] place-items-center rounded-full lg:hidden">
              <span className="relative block h-3 w-4">
                <i className={`absolute left-0 top-0 h-px w-4 bg-fg transition ${open ? "translate-y-[6px] rotate-45" : ""}`} />
                <i className={`absolute left-0 top-[11px] h-px w-4 bg-fg transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px origin-left bg-gradient-to-r from-aurora via-teal to-violet" style={{ transform: `scaleX(${p})`, opacity: solid ? 1 : 0 }} />
      </header>

      {/* mobile sheet */}
      <div className={`fixed inset-0 z-40 bg-bg/90 pt-24 backdrop-blur-2xl transition duration-500 lg:hidden ${open ? "visible opacity-100" : "invisible opacity-0"}`}>
        <nav className="mx-auto flex max-w-lg flex-col gap-1 px-6">
          {[["Home", "/"], ["Library", "/library"], ...SHELVES.map((s) => [s.label, s.href])].map(([l, h]) => (
            <Link key={l} href={h} className="flex items-center justify-between border-b border-line py-4 font-display text-3xl font-semibold tracking-[-0.04em]">
              {l}<span className="text-aurora">→</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}

/** Secondary navigation: always shows where you are in the library and lets you hop between shelves. */
export function LibraryTabs() {
  const path = usePath();
  const items: [string, string, (p: string) => boolean][] = [
    ["All", "/library", (p) => p.startsWith("/library")],
    ...SHELVES.map((s) => [s.label, s.href, (p: string) => p.startsWith(s.href) || (s.href === "/landing-pages" && p.startsWith("/templates"))] as [string, string, (p: string) => boolean]),
  ];
  return (
    <div className="fixed inset-x-0 top-[68px] z-40 border-b border-line bg-bg/60 backdrop-blur-xl">
      <div className="mx-auto flex h-11 max-w-[1320px] items-center gap-1 overflow-x-auto px-5 sm:px-8" role="navigation" aria-label="Library sections">
        {items.map(([l, h, test]) => {
          const on = test(path);
          return (
            <Link key={l} href={h} aria-current={on ? "page" : undefined} className={`relative shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] transition ${on ? "bg-white/10 text-fg" : "text-dim hover:text-fg"}`}>
              {on && <span className="absolute -bottom-[7px] left-1/2 h-px w-6 -translate-x-1/2 bg-gradient-to-r from-aurora to-teal" />}
              {l}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-line bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3 font-display text-lg font-semibold tracking-[0.02em]">
            <Logo size={26} /> {SITE.name}
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-dim">
            A library of cinematic 3D websites, app screens and interactive elements — as plain code. For people who ship with AI and would rather spend their tokens on the idea.
          </p>
        </div>
        <div className="space-y-3 text-sm">
          <div className="eyebrow !text-dim">The library</div>
          <Link className="block text-dim hover:text-fg" href="/library">Overview</Link>
          {SHELVES.map((s) => (
            <Link key={s.href} className="block text-dim hover:text-fg" href={s.href}>{s.label}</Link>
          ))}
        </div>
        <div className="space-y-3 text-sm">
          <div className="eyebrow !text-dim">Under the hood</div>
          <p className="text-dim">Three.js · vanilla JS · zero build step</p>
          <p className="text-dim">No AI runs on this site. Every world is hand-built, deterministic code.</p>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center font-mono text-[11px] tracking-[0.14em] text-dim uppercase">
        © 2026 Project {SITE.name} — light, in three dimensions
      </div>
    </footer>
  );
}
