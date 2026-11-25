"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";
import { frameProps, openDemo } from "@/lib/demo";

const DEVICES = {
  Desktop: "100%",
  Tablet: "820px",
  Mobile: "390px",
} as const;

export function PreviewFrame({ slug }: { slug: string }) {
  const [device, setDevice] = useState<keyof typeof DEVICES>("Desktop");
    return (
    <div className="panel overflow-hidden !rounded-[26px] p-2">
      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <i className="size-2.5 rounded-full bg-white/15" />
          <i className="size-2.5 rounded-full bg-white/15" />
          <i className="size-2.5 rounded-full bg-white/15" />
        </div>
        <div className="hidden max-w-sm flex-1 truncate rounded-full border border-line bg-black/30 px-4 py-1.5 text-center font-mono text-[11px] text-dim sm:block">
          {SITE.domain}/demo/{slug}
        </div>
        <div className="flex items-center gap-1">
          {(Object.keys(DEVICES) as (keyof typeof DEVICES)[]).map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`rounded-full px-3 py-1.5 text-xs transition ${device === d ? "bg-white/12 text-fg" : "text-dim hover:text-fg"}`}
            >
              {d}
            </button>
          ))}
          <button type="button" onClick={() => openDemo(slug)} className="ml-1 rounded-full px-3 py-1.5 text-xs text-aurora hover:bg-white/8">
            Fullscreen ↗
          </button>
        </div>
      </div>
      <div className="relative flex h-[min(74vh,760px)] justify-center overflow-hidden rounded-[18px] bg-black">
        <iframe
          key={device}
          {...frameProps(slug)}
          title={`${slug} interactive preview`}
          className="h-full border-0 transition-[width] duration-700"
          style={{ width: DEVICES[device], maxWidth: "100%" }}
          allow="fullscreen"
        />
        <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-line bg-black/60 px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-dim uppercase backdrop-blur-md">
          Live · scroll inside to explore
        </div>
      </div>
    </div>
  );
}
