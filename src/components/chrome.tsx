"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useNavPending, usePath } from "@/lib/router";
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

/** The shelves of the library — shared by mobile navigation, the hub and the footer. */
export const SHELVES: { label: string; href: string; hint: string }[] = [
  { label: "Landing pages", href: "/landing-pages", hint: "24 cinematic 3D sites to study" },
  { label: "App pages", href: "/pages", hint: "Auth, billing, dashboards" },
  { label: "Components", href: "/components", hint: "Drop-in pieces and live demos" },
  { label: "Text effects", href: "/text-effects", hint: "Import onto any text" },
  { label: "Prompts", href: "/prompts", hint: "Battle-tested prompts" },
];

const isLib = (p: string) =>
  ["/library", "/landing-pages", "/templates", "/pages", "/elements", "/components", "/text-effects", "/prompts"].some((x) => p.startsWith(x));

const Chevron = ({ open }: { open: boolean }) => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`transition duration-300 ${open ? "rotate-180" : ""}`}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const SHELF_ICONS: Record<string, string> = {
  "/landing-pages": "#5cffc4",
  "/pages": "#3de7ff",
  "/components": "#ff7ad9",
  "/text-effects": "#ffd28a",
  "/elements": "#a58bff",
  "/prompts": "#ff7ad9",
};

export function SiteNav() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [p, setP] = useState(0);
  const path = usePath();
  const pending = useNavPending();
  const wrap = useRef<HTMLDivElement>(null);
  const hoverT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setSolid(window.scrollY > 40);
        const h = document.documentElement.scrollHeight - innerHeight;
        setP(h > 0 ? Math.min(1, window.scrollY / h) : 0);
      });
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [path]);

  useEffect(() => { setOpen(false); setMenu(false); }, [path]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => void (document.body.style.overflow = "");
  }, [open]);

  useEffect(() => {
    if (!menu) return;
    const down = (e: PointerEvent) => { if (!wrap.current?.contains(e.target as Node)) setMenu(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setMenu(false); };
    addEventListener("pointerdown", down);
    addEventListener("keydown", key);
    return () => { removeEventListener("pointerdown", down); removeEventListener("keydown", key); };
  }, [menu]);

  const pill = (on: boolean) =>
    `relative flex items-center gap-2 rounded-full px-4 py-2 text-[13px] transition duration-300 ${
      on ? "bg-aurora/10 text-fg shadow-[inset_0_0_0_1px_rgb(92_255_196/0.28),0_0_22px_-8px_rgb(92_255_196/0.6)]" : "text-dim hover:bg-white/[0.07] hover:text-fg"
    }`;
  const dot = (on: boolean) => (
    <i aria-hidden className={`size-1 rounded-full bg-aurora shadow-[0_0_8px_#5cffc4] transition duration-300 ${on ? "scale-100 opacity-100" : "hidden"}`} />
  );
  const lib = isLib(path);
  const enter = () => { clearTimeout(hoverT.current); hoverT.current = setTimeout(() => setMenu(true), 80); };
  const leave = () => { clearTimeout(hoverT.current); hoverT.current = setTimeout(() => setMenu(false), 160); };

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-500 ${solid || open ? "border-b border-line bg-bg/70 shadow-[0_18px_50px_-30px_rgb(0_0_0/0.9)] backdrop-blur-xl" : "border-b border-transparent"}`}>
        <div className="mx-auto flex h-[68px] max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="group flex shrink-0 items-center gap-3 font-display text-[17px] font-semibold tracking-[0.02em]" aria-label={`${SITE.name} — home`}>
            <span className="transition duration-500 group-hover:drop-shadow-[0_0_10px_rgb(92_255_196/0.7)]"><Logo /></span>
            <span>{SITE.name}</span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-line bg-[rgb(6_10_20/0.55)] p-1 shadow-[0_1px_0_0_rgb(255_255_255/0.06)_inset,0_20px_50px_-30px_#000] backdrop-blur-xl md:flex" aria-label="Main">
            <Link href="/" className={pill(path === "/")} aria-current={path === "/" ? "page" : undefined}>{dot(path === "/")}Showcase</Link>
            <Link href="/frontier" className={pill(path === "/frontier")} aria-current={path === "/frontier" ? "page" : undefined}>{dot(path === "/frontier")}Frontier</Link>

            <div ref={wrap} className="relative" onPointerEnter={(e) => e.pointerType === "mouse" && enter()} onPointerLeave={(e) => e.pointerType === "mouse" && leave()}>
              <div className={`${pill(lib)} !gap-0 !p-0`}>
                <Link href="/library" onClick={() => setMenu(false)} className="flex items-center gap-2 rounded-full py-2 pl-4 pr-2" aria-current={lib ? "page" : undefined}>{dot(lib)}Library</Link>
                <button type="button" aria-label="Browse the library shelves" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)} className="grid h-full place-items-center rounded-full py-2 pl-1 pr-3.5 text-dim transition hover:text-fg">
                  <Chevron open={menu} />
                </button>
              </div>

              <div role="menu" aria-label="Library shelves" className={`absolute left-1/2 top-full w-[440px] -translate-x-1/2 pt-3 transition duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${menu ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}>
                <div className="relative overflow-hidden rounded-[22px] border border-white/12 bg-[rgb(5_8_16/0.97)] p-2 shadow-[0_30px_80px_-20px_#000] backdrop-blur-xl">
                  <div aria-hidden className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-aurora/70 to-transparent" />
                  <div className="grid grid-cols-2 gap-1">
                    {SHELVES.map((s) => (
                      <Link key={s.href} href={s.href} role="menuitem" tabIndex={menu ? 0 : -1} onClick={() => setMenu(false)} className={`group/item rounded-2xl px-3.5 py-3 transition duration-300 hover:bg-white/[0.06] ${path.startsWith(s.href) ? "bg-white/[0.05]" : ""}`}>
                        <div className="flex items-center gap-2 text-[13.5px] font-medium text-fg">
                          <i aria-hidden className="size-1.5 rounded-full" style={{ background: SHELF_ICONS[s.href], boxShadow: `0 0 10px ${SHELF_ICONS[s.href]}` }} />
                          {s.label}
                          <span aria-hidden className="ml-auto text-dim opacity-0 transition duration-300 group-hover/item:translate-x-0.5 group-hover/item:opacity-100">→</span>
                        </div>
                        <div className="mt-0.5 pl-3.5 text-[12px] text-dim">{s.hint}</div>
                      </Link>
                    ))}
                    <Link href="/bundles" role="menuitem" tabIndex={menu ? 0 : -1} onClick={() => setMenu(false)} className={`group/item rounded-2xl px-3.5 py-3 transition duration-300 hover:bg-white/[0.06] ${path.startsWith("/bundles") ? "bg-white/[0.05]" : ""}`}>
                      <div className="flex items-center gap-2 text-[13.5px] font-medium text-fg">
                        <i aria-hidden className="size-1.5 rounded-full" style={{ background: "#ffd28a", boxShadow: "0 0 10px #ffd28a" }} />
                        Bundles
                        <span aria-hidden className="ml-auto text-dim opacity-0 transition duration-300 group-hover/item:translate-x-0.5 group-hover/item:opacity-100">→</span>
                      </div>
                      <div className="mt-0.5 pl-3.5 text-[12px] text-dim">Ready-made packs, one download</div>
                    </Link>
                  </div>
                  <div className="mt-1 grid grid-cols-1 gap-1 border-t border-line pt-1">
                    <Link href="/library" role="menuitem" tabIndex={menu ? 0 : -1} onClick={() => setMenu(false)} className="rounded-2xl px-3.5 py-2.5 text-right text-[13px] text-aurora transition duration-300 hover:bg-white/[0.06]">Everything in one place →</Link>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/library#agent" className={pill(false)}>Agent link</Link>
          </nav>

          <div className="flex items-center gap-2">
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
        {/* page-change indicator: the next page is rendering while this one stays usable */}
        <div aria-hidden className={`pointer-events-none absolute inset-x-0 -bottom-px h-[2px] overflow-hidden transition-opacity duration-300 ${pending ? "opacity-100" : "opacity-0"}`}>
          <div className="h-full w-1/3 animate-[nav-slide_1s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-aurora to-transparent" />
        </div>
      </header>

      {/* mobile sheet */}
      <div className={`fixed inset-0 z-40 overflow-y-auto bg-bg/95 pb-10 pt-24 backdrop-blur-2xl transition duration-500 md:hidden ${open ? "visible opacity-100" : "invisible opacity-0"}`}>
        <nav className="mx-auto flex max-w-lg flex-col px-6" aria-label="Mobile">
          {[["Showcase", "/"], ["Library — free", "/library"], ["Agent link", "/library#agent"], ["Services — from $" + SKILL.price, "/services"]].map(([l, h], i) => (
            <Link
              key={h}
              href={h}
              tabIndex={open ? 0 : -1}
              style={{ transitionDelay: open ? `${120 + i * 70}ms` : "0ms" }}
              className={`flex items-center justify-between border-b border-line py-4 font-display text-[28px] font-semibold tracking-[-0.04em] transition duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
            >
              {l}<span className="text-aurora">→</span>
            </Link>
          ))}
          <div className={`mt-6 grid grid-cols-2 gap-2 transition duration-500 ${open ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: open ? "420ms" : "0ms" }}>
            {[...SHELVES.map((s) => [s.label, s.href]), ["Bundles", "/bundles"]].map(([l, h]) => (
              <Link key={h} href={h} tabIndex={open ? 0 : -1} className="rounded-2xl border border-line px-4 py-3 text-[14px] text-dim transition hover:border-line-strong hover:text-fg">{l}</Link>
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
      <div className="mx-auto grid grid-cols-[minmax(0,1fr)] max-w-[1320px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
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
          <Link className="block text-dim hover:text-fg" href="/frontier">AURA v18 · live frontier world</Link>
          <Link className="block text-dim hover:text-fg" href="/services#pipeline">The pipeline</Link>
          <Link className="block text-dim hover:text-fg" href="/services#pricing">Pricing</Link>
          <Link className="block text-dim hover:text-fg" href="/services#faq">FAQ</Link>
        </div>
        <div className="space-y-3 text-sm">
          <div className="eyebrow !text-dim">Services</div>
          <Link className="block text-dim hover:text-fg" href="/library#agent">Get your agent link</Link>
          <Link className="block text-dim hover:text-fg" href="/">Showcase</Link>
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
