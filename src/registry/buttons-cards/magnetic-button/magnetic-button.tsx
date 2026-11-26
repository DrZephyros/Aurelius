"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";

export type MagneticButtonProps = {
  children: ReactNode;
  /** Pull strength 0–1 (how far the button follows the pointer). */
  strength?: number;
  /** Renders an <a> when provided. */
  href?: string;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-mb{display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .5s cubic-bezier(.16,1,.3,1);will-change:transform;border-radius:999px;padding:14px 28px;font-weight:600;color:var(--au-bg,#021510);background:var(--au-accent,#5cffc4);text-decoration:none}
.au-mb-i{display:inline-block;transition:transform .5s cubic-bezier(.16,1,.3,1)}
.au-mb.au-live,.au-mb.au-live .au-mb-i{transition:transform .12s linear}`;

/** A button that leans toward the cursor, with its label drifting even further for depth. */
export function MagneticButton({ children, strength = 0.35, href, onClick, className, style }: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const move = (e: React.PointerEvent) => {
    if (e.pointerType === "touch") return;
    const el = ref.current!, r = el.getBoundingClientRect();
    const k = r.width / el.offsetWidth || 1; // undo any CSS scale on an ancestor
    const dx = (e.clientX - (r.left + r.width / 2)) / k, dy = (e.clientY - (r.top + r.height / 2)) / k;
    el.classList.add("au-live");
    el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    inner.current!.style.transform = `translate(${dx * strength * 0.5}px, ${dy * strength * 0.5}px)`;
  };
  const leave = () => {
    ref.current!.classList.remove("au-live");
    ref.current!.style.transform = "";
    inner.current!.style.transform = "";
  };
  const body = <span ref={inner} className="au-mb-i">{children}</span>;
  const common = { className: `au-mb ${className ?? ""}`, style, onPointerMove: move, onPointerLeave: leave, onClick };
  return (
    <>
      <style>{CSS}</style>
      {href ? <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} {...common}>{body}</a> : <button ref={ref as React.Ref<HTMLButtonElement>} type="button" {...common}>{body}</button>}
    </>
  );
}
