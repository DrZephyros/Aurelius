"use client";

import { useId, type CSSProperties, type ReactNode } from "react";

export type TooltipProps = {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  /** ms before it shows. */
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

const CSS = `.au-tt{position:relative;display:inline-flex}
.au-tt-b{position:absolute;z-index:100;pointer-events:none;white-space:nowrap;padding:6px 10px;border-radius:10px;font-size:12.5px;line-height:1.3;background:#0c111d;color:#e9f1f5;border:1px solid rgb(255 255 255/.14);box-shadow:0 10px 30px -10px rgb(0 0 0/.6);opacity:0;visibility:hidden;transition:opacity .18s,transform .18s,visibility .18s;transition-delay:0s}
.au-tt:hover .au-tt-b,.au-tt:focus-within .au-tt-b{opacity:1;visibility:visible;transition-delay:var(--au-delay)}
.au-tt-top{bottom:calc(100% + 8px);left:50%;transform:translate(-50%,4px)}.au-tt:hover .au-tt-top,.au-tt:focus-within .au-tt-top{transform:translate(-50%,0)}
.au-tt-bottom{top:calc(100% + 8px);left:50%;transform:translate(-50%,-4px)}.au-tt:hover .au-tt-bottom,.au-tt:focus-within .au-tt-bottom{transform:translate(-50%,0)}
.au-tt-left{right:calc(100% + 8px);top:50%;transform:translate(4px,-50%)}.au-tt:hover .au-tt-left,.au-tt:focus-within .au-tt-left{transform:translate(0,-50%)}
.au-tt-right{left:calc(100% + 8px);top:50%;transform:translate(-4px,-50%)}.au-tt:hover .au-tt-right,.au-tt:focus-within .au-tt-right{transform:translate(0,-50%)}`;

/** Lightweight CSS tooltip: shows on hover and keyboard focus, wired with aria-describedby. */
export function Tooltip({ content, children, side = "top", delay = 150, className, style }: TooltipProps) {
  const id = useId();
  return (
    <span className={`au-tt ${className ?? ""}`} style={{ ["--au-delay" as string]: `${delay}ms`, ...style }} aria-describedby={id}>
      <style>{CSS}</style>
      {children}
      <span id={id} role="tooltip" className={`au-tt-b au-tt-${side}`}>{content}</span>
    </span>
  );
}
