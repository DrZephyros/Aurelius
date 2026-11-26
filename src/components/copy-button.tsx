"use client";

import { useState } from "react";
import { bump } from "@/lib/stats";

export function CopyButton({
  text,
  label = "Copy",
  slug,
  className = "",
}: {
  text: string;
  label?: string;
  slug?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setDone(true);
    setTimeout(() => setDone(false), 1800);
    if (slug) bump(slug, "prompt");
  }
  return (
    <button type="button" onClick={copy} className={className.includes("btn-primary") ? className : `btn btn-ghost btn-sm ${className}`} aria-live="polite">
      {done ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5cffc4" strokeWidth="2.5"><path d="m5 12 5 5 9-10" /></svg> Copied
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg> {label}
        </>
      )}
    </button>
  );
}
