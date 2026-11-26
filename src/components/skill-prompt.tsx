"use client";

import { useState } from "react";
import { SKILL_PROMPT } from "@/lib/skill";

/** The single install prompt for any agent: shows it and copies it. */
export function SkillPrompt() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SKILL_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the prompt stays selectable on the page */
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-line bg-[#05080f] p-6 sm:p-8">
      <div className="grid-dots pointer-events-none absolute inset-0 opacity-40" aria-hidden />
      <div className="relative">
        <div className="font-mono text-[10.5px] tracking-[0.2em] text-dim uppercase">Paste into any agent</div>
        <p className="mt-5 font-mono text-[15px] leading-[1.8] text-fg/90 sm:text-[17px]">{SKILL_PROMPT}</p>
        <div className="mt-7">
          <button type="button" onClick={copy} className="btn btn-primary btn-shimmer h-[48px] px-6">{copied ? "Copied ✓" : "Copy prompt"}</button>
        </div>
      </div>
    </div>
  );
}
