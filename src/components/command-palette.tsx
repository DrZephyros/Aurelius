"use client";

import { openSkill } from "@/lib/studio";
import { BUNDLES } from "@/bundles/data";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@/lib/router";
import { TEMPLATES } from "@/lib/templates";
import { ELEMENTS, PAGES } from "@/lib/collections";
import { LIBRARY } from "@/lib/library";
import { REG_ITEMS, TEXT_EFFECTS, catBySlug, itemHref } from "@/lib/registry";

type Item = { id: string; group: string; title: string; hint: string; run: () => void; accent?: string };

const onPath = (p: string) => (location.pathname.replace(/\/$/, "") || "/") === p;

/** ⌘K / Ctrl+K — jump to any template, prompt, bundle or section. */
export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const typing = /input|textarea|select/i.test((e.target as HTMLElement)?.tagName ?? "");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") setOpen(false);
    };
    const ev = () => setOpen(true);
    addEventListener("keydown", key);
    addEventListener("aurelius:palette", ev);
    return () => {
      removeEventListener("keydown", key);
      removeEventListener("aurelius:palette", ev);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setI(0);
      setTimeout(() => input.current?.focus(), 30);
      document.body.style.overflow = "hidden";
      return () => void (document.body.style.overflow = "");
    }
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const go = (href: string) => () => navigate(href);
    return [
      { id: "p-home", group: "Go to", title: "Home", hint: "Start", run: go("/") },
      { id: "a-studio", group: "Actions", title: "Open the Skill Studio", hint: "Brief it, copy the prompt, grab the skill — right here (⌘J)", run: () => openSkill() },
      { id: "p-skill", group: "Go to", title: "Make your own — the AURA skill", hint: "Teach an agent to build immersive 3D sites", run: go("/services#skill") },
      { id: "p-services", group: "Go to", title: "Services — the skill ($25) & build-for-you ($80)", hint: "Buy AURA or book a custom build", run: go("/services") },
      { id: "p-agent", group: "Go to", title: "Get my agent link", hint: "One URL that gives any AI agent the whole free library", run: go("/library#agent") },
      { id: "p-library", group: "Go to", title: "Library", hint: "All the shelves", run: go("/library") },
      { id: "p-landing", group: "Go to", title: "Landing pages", hint: `${TEMPLATES.length} 3D templates`, run: go("/landing-pages") },
      { id: "p-pages", group: "Go to", title: "App pages", hint: "Sign in, pricing, dashboard…", run: go("/pages") },
      { id: "p-components", group: "Go to", title: "Components", hint: `${REG_ITEMS.length} drop-in React components`, run: go("/components") },
      { id: "p-text", group: "Go to", title: "Text effects", hint: "Import onto any text", run: go("/text-effects") },
      { id: "p-prompts", group: "Go to", title: "Prompt library", hint: `${LIBRARY.length}+ prompts`, run: go("/prompts") },
      { id: "p-bundles", group: "Go to", title: "Bundles", hint: `${BUNDLES.length} immersive 3D sites + matching pages`, run: go("/bundles") },
      ...REG_ITEMS.map((i) => ({ id: "rg-" + i.category + i.slug, group: i.category === TEXT_EFFECTS ? "Text effects" : "Components", title: i.name, hint: `${catBySlug(i.category)?.name} · ${i.tagline}`, run: go(itemHref(i.category, i.slug)) })),
      ...PAGES.map((d) => ({ id: "pg-" + d.slug, group: "App pages", title: d.name, hint: d.tagline, accent: d.accent, run: go(`/pages/${d.slug}`) })),
      ...ELEMENTS.map((d) => ({ id: "el-" + d.slug, group: "Components", title: d.name, hint: d.tagline, accent: d.accent, run: go(`/elements/${d.slug}`) })),
      ...TEMPLATES.map((t) => ({ id: "t-" + t.slug, group: "Landing pages", title: t.name, hint: t.tagline, accent: t.accent, run: go(`/templates/${t.slug}`) })),
      ...BUNDLES.map((b) => ({ id: "bd-" + b.slug, group: "Bundles", title: b.name, hint: b.tagline, accent: b.theme.accent, run: go(`/bundles/${b.slug}`) })),
      ...LIBRARY.map((p) => ({
        id: "pr-" + p.id, group: "Prompts", title: p.title, hint: p.category,
        run: () => {
          sessionStorage.setItem("aurelius:openPrompt", p.id);
          if (onPath("/prompts")) {
            window.dispatchEvent(new CustomEvent("aurelius:prompt", { detail: p.id }));
            sessionStorage.removeItem("aurelius:openPrompt");
          } else navigate("/prompts");
        },
      })),
    ];
  }, [navigate]);

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return items.slice(0, 14);
    return items
      .map((it) => {
        const hay = (it.title + " " + it.hint + " " + it.group).toLowerCase();
        if (!words.every((w) => hay.includes(w))) return null;
        return { it, s: it.title.toLowerCase().startsWith(words[0]) ? 0 : it.title.toLowerCase().includes(words[0]) ? 1 : 2 };
      })
      .filter((x): x is { it: Item; s: number } => !!x)
      .sort((a, b) => a.s - b.s)
      .map((x) => x.it)
      .slice(0, 30);
  }, [q, items]);

  useEffect(() => setI(0), [q]);
  useEffect(() => {
    document.getElementById("cp-" + i)?.scrollIntoView({ block: "nearest" });
  }, [i]);

  if (!open) return null;
  const choose = (it?: Item) => {
    if (!it) return;
    setOpen(false);
    setTimeout(it.run, 20);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[14vh] backdrop-blur-sm" onMouseDown={() => setOpen(false)}>
      <div
        role="dialog"
        aria-label="Search"
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-line-strong bg-[#0d1016] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="text-dim"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setI((x) => Math.min(results.length - 1, x + 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
              else if (e.key === "Enter") choose(results[i]);
            }}
            placeholder="Search bundles, templates, prompts…"
            className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-dim/60"
          />
          <kbd className="rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-dim">esc</kbd>
        </div>
        <div className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && <div className="px-4 py-10 text-center text-sm text-dim">Nothing found for “{q}”.</div>}
          {results.map((it, n) => (
            <div key={it.id}>
              {(n === 0 || results[n - 1].group !== it.group) && <div className="px-3 pb-1 pt-3 font-mono text-[10px] tracking-[0.18em] text-dim uppercase">{it.group}</div>}
              <button
                id={"cp-" + n}
                onMouseMove={() => setI(n)}
                onClick={() => choose(it)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${n === i ? "bg-white/[0.07]" : ""}`}
              >
                <i className="size-2 shrink-0 rotate-45" style={{ background: it.accent ?? "var(--color-aurora)" }} />
                <span className="min-w-0 flex-1 truncate text-sm">{it.title}</span>
                <span className="max-w-[45%] truncate text-xs text-dim">{it.hint}</span>
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-line px-5 py-3 font-mono text-[10px] tracking-[0.12em] text-dim uppercase">
          <span>↑ ↓ navigate · ↵ open</span>
          <span>⌘K to toggle</span>
        </div>
      </div>
    </div>
  );
}
