"use client";

import { useRef, useState, type CSSProperties, type ReactNode } from "react";

export type CopyButtonProps = {
  /** Text to copy. */
  text: string;
  /** Label shown by default. Use `children` for fully custom content. */
  label?: string;
  copiedLabel?: string;
  children?: ReactNode;
  onCopy?: () => void;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-cb2{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 14px;border-radius:999px;font-size:13px;font-weight:500;cursor:pointer;color:inherit;border:1px solid var(--au-border,rgb(255 255 255/.18));background:rgb(255 255 255/.05);transition:background .2s,border-color .2s,color .2s,transform .2s}
.au-cb2:hover{background:rgb(255 255 255/.1)}.au-cb2:active{transform:scale(.96)}.au-cb2.au-ok{border-color:var(--au-accent,#5cffc4);color:var(--au-accent,#5cffc4)}
.au-cb2 svg{width:15px;height:15px}`;

/** Copy-to-clipboard button with animated check, secure-context fallback and ARIA live feedback. */
export function CopyButton({ text, label = "Copy", copiedLabel = "Copied!", children, onCopy, className, style }: CopyButtonProps) {
  const [ok, setOk] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
    setOk(true); onCopy?.();
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOk(false), 1800);
  };
  return (
    <button type="button" onClick={copy} className={`au-cb2 ${ok ? "au-ok" : ""} ${className ?? ""}`} style={style}>
      <style>{CSS}</style>
      {ok
        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7" /></svg>
        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="12" height="12" rx="3" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>}
      <span aria-live="polite">{children ?? (ok ? copiedLabel : label)}</span>
    </button>
  );
}
