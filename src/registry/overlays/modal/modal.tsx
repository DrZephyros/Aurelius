"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** "center" dialog, "right" drawer or "bottom" sheet. */
  placement?: "center" | "right" | "bottom";
  /** Close when the backdrop is clicked. */
  dismissible?: boolean;
  /** Panel width for center/right (CSS length). */
  width?: string;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-md{position:fixed;inset:0;z-index:1000;display:flex;background:rgb(2 4 10/.6);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .3s}
.au-md.au-in{opacity:1}
.au-md-c{align-items:center;justify-content:center;padding:20px}.au-md-r{justify-content:flex-end}.au-md-b{align-items:flex-end;justify-content:center}
.au-md-p{position:relative;max-height:100%;overflow:auto;background:#0c111d;color:#e9f1f5;border:1px solid rgb(255 255 255/.12);box-shadow:0 40px 100px -20px rgb(0 0 0/.7);padding:28px;transition:transform .5s cubic-bezier(.16,1,.3,1),opacity .3s}
.au-md-c .au-md-p{width:min(var(--au-w),100%);border-radius:24px;transform:translateY(18px) scale(.97);opacity:0}
.au-md-r .au-md-p{width:min(var(--au-w),100%);height:100%;border-radius:24px 0 0 24px;transform:translateX(100%)}
.au-md-b .au-md-p{width:min(var(--au-w),100%);border-radius:24px 24px 0 0;transform:translateY(100%)}
.au-in .au-md-p{transform:none;opacity:1}
.au-md-x{position:absolute;right:14px;top:14px;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;cursor:pointer;opacity:.6;color:inherit}.au-md-x:hover{opacity:1;background:rgb(255 255 255/.08)}
@media (prefers-reduced-motion:reduce){.au-md,.au-md-p{transition:none}}`;

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

/** Accessible dialog / side drawer / bottom sheet: focus trap, Esc to close, scroll lock, focus restore, portal to <body>. */
export function Modal({ open, onClose, title, children, placement = "center", dismissible = true, width = "480px", className, style }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    if (open) { setMounted(true); const r = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true))); return () => cancelAnimationFrame(r); }
    setShown(false);
    const t = setTimeout(() => setMounted(false), 350);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus() ?? panel.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); onClose(); }
      if (e.key !== "Tab" || !panel.current) return;
      const f = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (!f.length) return e.preventDefault();
      const a = document.activeElement;
      if (e.shiftKey && a === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && a === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    };
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown", key); document.body.style.overflow = overflow; prev?.focus?.(); };
  }, [open, onClose]);

  if (!mounted) return null;
  const cls = placement === "right" ? "au-md-r" : placement === "bottom" ? "au-md-b" : "au-md-c";
  return createPortal(
    <div className={`au-md ${cls} ${shown ? "au-in" : ""}`} onMouseDown={(e) => { if (dismissible && e.target === e.currentTarget) onClose(); }}>
      <style>{CSS}</style>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={title ? id : undefined} tabIndex={-1} className={`au-md-p ${className ?? ""}`} style={{ ["--au-w" as string]: width, outline: "none", ...style }}>
        <button className="au-md-x" onClick={onClose} aria-label="Close">✕</button>
        {title && <h2 id={id} style={{ margin: "0 36px 14px 0", fontSize: 22, fontWeight: 600, letterSpacing: "-0.03em" }}>{title}</h2>}
        {children}
      </div>
    </div>,
    document.body
  );
}
