"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "@/lib/router";
import { DEMOS } from "@/registry/demos";
import { downloadClick, itemHref, type RegItem } from "@/lib/registry";

/* Components that act on the whole page (they would hide the cursor / pin things site-wide) only run on their own detail page. */
const GLOBAL = new Set(["scroll-motion/custom-cursor"]);

export const CAT_COLORS = ["#5cffc4", "#3de7ff", "#a58bff", "#ff7ad9", "#ffd28a", "#7bffa1", "#6fb4ff", "#ff9d6c", "#c1a3ff", "#4ee3c1"];

const STAGE_BG = "radial-gradient(90% 80% at 50% 0%, rgb(92 255 196 / 0.07), transparent 60%), #05070d";
const GRID = "linear-gradient(rgb(255 255 255 / 0.035) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.035) 1px, transparent 1px)";

/** Renders a component's real demo. "card" mode scales a 900×560 canvas to fit; "full" mode is 1:1 and scrollable. */
export function DemoStage({ id, mode = "card", replay = 0, className = "" }: { id: string; mode?: "card" | "full"; replay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  const [scale, setScale] = useState(0.4);
  const Demo = DEMOS[id];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { rootMargin: "160px" });
    io.observe(el);
    const ro = new ResizeObserver(() => setScale(el.clientWidth / 900));
    ro.observe(el);
    setScale(el.clientWidth / 900);
    return () => { io.disconnect(); ro.disconnect(); };
  }, []);

  const bg: CSSProperties = { background: `${GRID}, ${STAGE_BG}`, backgroundSize: "44px 44px, 44px 44px, auto" };
  const blocked = mode === "card" && GLOBAL.has(id);

  if (mode === "full") {
    return (
      <div ref={ref} className={`relative h-[min(66vh,560px)] min-h-[380px] overflow-hidden ${className}`} style={bg}>
        <div className="absolute inset-0 grid place-items-center overflow-auto p-6 sm:p-10">{vis && Demo ? <Demo key={replay} /> : null}</div>
      </div>
    );
  }
  return (
    <div ref={ref} className={`relative aspect-[16/10] w-full overflow-hidden ${className}`} style={bg}>
      <div className="absolute left-0 top-0" style={{ width: 900, height: 562, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
        <div className="absolute inset-0 grid place-items-center overflow-hidden p-8">
          {blocked ? (
            <div className="text-center text-[22px] text-white/60">Global component<br /><span className="text-[15px] text-white/35">live on the detail page</span></div>
          ) : vis && Demo ? <Demo key={replay} /> : null}
        </div>
      </div>
    </div>
  );
}

export function RegistryCard({ item, index, accent }: { item: RegItem; index: number; accent: string }) {
  return (
    <article className="tcard panel spot group flex flex-col overflow-hidden !rounded-[24px]" style={{ "--c": accent } as CSSProperties}>
      <div className="flex items-center gap-3 border-b border-line bg-black/40 px-4 py-2.5">
        <div className="flex gap-1.5"><i className="size-2 rounded-full bg-white/15" /><i className="size-2 rounded-full bg-white/15" /><i className="size-2 rounded-full bg-white/15" /></div>
        <div className="min-w-0 flex-1 truncate rounded-full border border-line bg-black/30 px-3 py-1 text-center font-mono text-[10.5px] text-dim">{item.file}</div>
        <span className="font-mono text-[9.5px] tracking-[0.18em] text-dim uppercase">N°{String(index + 1).padStart(2, "0")}</span>
      </div>
      <DemoStage id={`${item.category}/${item.slug}`} />
      <div className="flex flex-1 items-end justify-between gap-3 p-5">
        <Link href={itemHref(item.category, item.slug)} className="min-w-0 flex-1" aria-label={`Open ${item.name}`}>
          <div className="font-display text-lg font-semibold tracking-[-0.03em]">{item.name}</div>
          <div className="mt-1 line-clamp-2 text-[13px] leading-snug text-dim">{item.tagline}</div>
          <div className="mt-3 flex flex-wrap gap-1.5">{item.tags.slice(0, 3).map((t) => <span key={t} className="chip !h-[22px] !px-2 !text-[9.5px]">{t}</span>)}</div>
        </Link>
        <a href="#download" onClick={downloadClick(item.category, item.slug)} className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong text-dim transition hover:border-aurora hover:bg-aurora hover:text-black" aria-label={`Download ${item.name}`} title="Download zip (component + README)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></svg>
        </a>
      </div>
    </article>
  );
}

/* ── tiny markdown renderer for the README panel ──────────── */
function inline(s: string): ReactNode[] {
  return s.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).map((p, i) => {
    if (p.startsWith("`")) return <code key={i} className="rounded bg-white/8 px-1.5 py-0.5 font-mono text-[0.86em] text-aurora">{p.slice(1, -1)}</code>;
    if (p.startsWith("**")) return <strong key={i} className="font-semibold text-fg">{p.slice(2, -2)}</strong>;
    const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m) return <a key={i} href={m[2]} className="text-aurora underline">{m[1]}</a>;
    return p;
  });
}

const cells = (row: string) => row.replace(/\\\|/g, "\u0000").replace(/^\||\|$/g, "").split("|").map((c) => c.replace(/\u0000/g, "|").trim());

export function Markdown({ source }: { source: string }) {
  const lines = source.split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (l.startsWith("```")) {
      const buf: string[] = [];
      for (i++; i < lines.length && !lines[i].startsWith("```"); i++) buf.push(lines[i]);
      i++;
      out.push(<pre key={out.length} className="code my-4 overflow-x-auto rounded-xl border border-line bg-[#090b0f] p-4 text-[12.5px] leading-relaxed text-[#cdd3df]"><code>{buf.join("\n")}</code></pre>);
    } else if (/^#{1,3} /.test(l)) {
      const n = l.match(/^#+/)![0].length, t = l.replace(/^#+ /, "");
      out.push(n === 1 ? <h2 key={out.length} className="font-display mt-2 text-2xl font-semibold tracking-[-0.03em]">{t}</h2> : n === 2 ? <h3 key={out.length} className="font-display mt-8 mb-2 text-lg font-semibold tracking-[-0.02em] text-fg">{t}</h3> : <h4 key={out.length} className="mt-6 mb-1 font-semibold text-fg">{t}</h4>);
      i++;
    } else if (l.startsWith("|") && /^\|[\s:|-]+\|$/.test(lines[i + 1] ?? "")) {
      const head = cells(l);
      const rows: string[][] = [];
      for (i += 2; i < lines.length && lines[i].startsWith("|"); i++) rows.push(cells(lines[i]));
      out.push(
        <div key={out.length} className="my-4 overflow-x-auto rounded-xl border border-line">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-white/4 text-dim"><tr>{head.map((h) => <th key={h} className="px-3.5 py-2.5 font-medium">{h}</th>)}</tr></thead>
            <tbody>{rows.map((r, k) => <tr key={k} className="border-t border-line align-top">{r.map((c, j) => <td key={j} className="px-3.5 py-2.5 text-fg/80">{inline(c)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      );
    } else if (l.startsWith("> ")) {
      const buf: string[] = [];
      for (; i < lines.length && lines[i].startsWith(">"); i++) buf.push(lines[i].replace(/^>\s?/, ""));
      out.push(<blockquote key={out.length} className="my-4 rounded-r-xl border-l-2 border-aurora bg-aurora/6 px-4 py-3 text-[14px] leading-relaxed text-fg/85">{inline(buf.join(" "))}</blockquote>);
    } else if (/^(- |\d+\. )/.test(l)) {
      const ordered = /^\d+\./.test(l), buf: string[] = [];
      for (; i < lines.length && /^(- |\d+\. )/.test(lines[i]); i++) buf.push(lines[i].replace(/^(- |\d+\. )/, ""));
      const items = buf.map((b, k) => <li key={k} className="pl-1 text-[14px] leading-relaxed text-fg/80">{inline(b)}</li>);
      out.push(ordered ? <ol key={out.length} className="my-3 list-decimal space-y-1.5 pl-6 marker:text-aurora">{items}</ol> : <ul key={out.length} className="my-3 list-disc space-y-1.5 pl-6 marker:text-aurora">{items}</ul>);
    } else if (l.trim() === "") i++;
    else {
      const buf: string[] = [];
      for (; i < lines.length && lines[i].trim() !== "" && !/^(```|#|\||> |- |\d+\. )/.test(lines[i]); i++) buf.push(lines[i]);
      if (!buf.length) { buf.push(lines[i]); i++; }
      out.push(<p key={out.length} className="my-3 text-[14.5px] leading-relaxed text-fg/80">{inline(buf.join(" "))}</p>);
    }
  }
  return <div>{out}</div>;
}
