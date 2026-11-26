"use client";

import { useEffect, useRef, useState } from "react";
import { Link, usePath } from "@/lib/router";
import { SITE, SKILL } from "@/lib/site";

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

/** The shelves of the library — shared by the nav dropdown, the hub and the footer. */
export const SHELVES: { label: string; href: string; hint: string }[] = [
  { label: "Landing pages", href: "/landing-pages", hint: "24 cinematic 3D sites to study" },
  { label: "App pages", href: "/pages", hint: "Auth, billing, dashboards" },
  { label: "Components", href: "/components", hint: "Drop-in React pieces" },
  { label: "Text effects", href: "/text-effects", hint: "Import onto any text" },
  { label: "Elements", href: "/elements", hint: "Interactive demos" },
  { label: "Prompts", href: "/prompts", hint: "Battle-tested prompts" },
];

const PRIMARY: [string, string][] = [
  ["Showcase", "/bundles"],
  ["Agent link", "/library#agent"],
];

const isLib = (p: string) =>
  ["/library", "/landing-pages", "/templates", "/pages", "/elements", "/components", "/text-effects", "/prompts"].some((x) => p.startsWith(x));

export function SiteNav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [p, setP] = useState(0);
  const path = usePath();
  const libRef = useRef<HTMLDivElement>(null);

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
  useEffect(() => { setOpen(false); setMenu(false); }, [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => void (document.body.style.overflow = "");
  }, [open]);
  useEffect(() => {
    if (!menu) return;
    const off = (e: PointerEvent) => { if (!libRef.current?.contains(e.target as Node)) setMenu(false); };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    addEventListener("pointerdown", off);
    addEventListener("keydown", esc);
    return () => { removeEventListener("pointerdown", off); removeEventListener("keydown", esc); };
  }, [menu]);

  const pill = (on: boolean) => `rounded-full px-4 py-2 text-[13px] transition ${on ? "bg-white/12 text-fg" : "text-dim hover:bg-white/8 hover:text-fg"}`;

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${solid || open ? "border-b border-line bg-bg/75 backdrop-blur-xl" : "border-b border-transparent"}`}>
        <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="group flex shrink-0 items-center gap-3 font-display text-[17px] font-semibold tracking-[0.02em]">
            <Logo />
            <span>{SITE.name}</span>
          </Link>

          <nav className="glass hidden items-center gap-1 rounded-full p-1 md:flex" aria-label="Main">
            {PRIMARY.map(([l, h]) => {
              const on = h === "/bundles" && path.startsWith("/bundles");
              return (
                <Link key={h} href={h} className={pill(on)} aria-current={on ? "page" : undefined}>
                  {l}
                </Link>
              );
            })}
            <div ref={libRef} className="relative">
              <button type="button" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)} className={`${pill(isLib(path) || menu)} flex items-center gap-1.5`}>
                Library
                <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className={`transition ${menu ? "rotate-180" : ""}`}><path d="m2 4 4 4 4-4" /></svg>
              </button>
              <div role="menu" className={`absolute right-0 top-[calc(100%+12px)] w-[320px] origin-top-right rounded-2xl border border-line bg-[rgb(6_9_16/0.96)] p-2 shadow-2xl backdrop-blur-2xl transition duration-200 ${menu ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"}`}>
                <div className="px-3 pb-1 pt-2 font-mono text-[10px] tracking-[0.18em] text-dim uppercase">Study &amp; steal</div>
                {SHELVES.map((s) => (
                  <Link key={s.href} href={s.href} role="menuitem" className="flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-white/8">
                    <span><span className="block text-[14px] text-fg">{s.label}</span><span className="block text-[12px] text-dim">{s.hint}</span></span>
                    <span className="text-aurora">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("aurelius:palette"))}
              className="glass hidden h-[38px] items-center gap-2 rounded-full px-3.5 text-[13px] text-dim transition hover:text-fg xl:flex"
              aria-label="Search (Ctrl K)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <kbd className="rounded border border-line px-1.5 font-mono text-[10px]">⌘K</kbd>
            </button>
            <Link href="/services" className="aurora-ring" aria-current={path === "/services" ? "page" : undefined}>Services <span aria-hidden className="text-[#8fb4ff]">→</span></Link>
            <button type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="glass grid size-[38px] place-items-center rounded-full md:hidden">
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
      <div className={`fixed inset-0 z-40 overflow-y-auto bg-bg/95 pb-10 pt-24 backdrop-blur-2xl transition duration-500 md:hidden ${open ? "visible opacity-100" : "invisible opacity-0"}`}>
        <nav className="mx-auto flex max-w-lg flex-col px-6" aria-label="Mobile">
          {[["Home", "/"], ["Library — free", "/library"], ["Agent link", "/library#agent"], ["Showcase", "/bundles"], ["Services — from $" + SKILL.price, "/services"]].map(([l, h]) => (
            <Link key={h} href={h} className="flex items-center justify-between border-b border-line py-4 font-display text-[28px] font-semibold tracking-[-0.04em]">
              {l}<span className="text-aurora">→</span>
            </Link>
          ))}
          <div className="eyebrow mt-8 !text-dim">Library</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {SHELVES.map((s) => (
              <Link key={s.href} href={s.href} className="rounded-xl border border-line px-4 py-3 text-[14px] text-fg/90">{s.label}</Link>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-line bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3 font-display text-lg font-semibold tracking-[0.02em]">
            <Logo size={26} /> {SITE.name}
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-dim">
            The skill that teaches an AI agent to direct, build and QA AAA-grade 3D websites. Start with the free library, upgrade when you want the art director.
          </p>
          <Link href="/services" className="aurora-ring mt-6">Services <span aria-hidden className="text-[#8fb4ff]">→</span></Link>
        </div>
        <div className="space-y-3 text-sm">
          <div className="eyebrow !text-dim">Product</div>
          <Link className="block text-aurora hover:text-fg" href="/skill">AURA — the skill</Link>
          <Link className="block text-dim hover:text-fg" href="/services#directions">Art directions</Link>
          <Link className="block text-dim hover:text-fg" href="/services#examples">Examples</Link>
          <Link className="block text-dim hover:text-fg" href="/services#faq">FAQ</Link>
        </div>
        <div className="space-y-3 text-sm">
          <div className="eyebrow !text-dim">Services</div>
          <Link className="block text-dim hover:text-fg" href="/services#build">Build it for me · $199</Link>
          <Link className="block text-dim hover:text-fg" href="/library#agent">Get your agent link</Link>
          <Link className="block text-dim hover:text-fg" href="/bundles">Showcase</Link>
        </div>
        <div className="space-y-3 text-sm">
          <div className="eyebrow !text-dim">Library</div>
          {SHELVES.map((s) => (
            <Link key={s.href} className="block text-dim hover:text-fg" href={s.href}>{s.label}</Link>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-3 px-5 py-6 text-[12px] text-dim sm:px-8">
          <span>© 2026 {SITE.name} — light, in three dimensions</span>
          <span className="font-mono tracking-[0.12em] uppercase">Three.js · Next.js · AURA {SKILL.version}</span>
        </div>
      </div>
    </footer>
  );
}
