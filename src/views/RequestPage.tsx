"use client";

import { useState } from "react";
import { Link } from "@/lib/router";
import { RequestForm } from "@/components/request-form";

export default function RequestPage() {
  const [done, setDone] = useState(false);
  return (
    <main className="mx-auto max-w-[1200px] px-5 pb-28 pt-36 sm:px-8">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <div className="eyebrow">Custom build</div>
          <h1 className="h-display mt-5 text-[clamp(2.6rem,6vw,5.4rem)] leading-[0.92]">Want one made<br /><span className="aurora-text">for you?</span></h1>
          <p className="mt-6 max-w-[480px] text-[16px] leading-relaxed text-fg/70">Tell me about the product, place or person. I'll direct and build a scroll-driven 3D experience with the AURA skill — then hand-finish it to a standard worth paying for.</p>
          <ul className="mt-8 space-y-3 text-[14px] text-fg/80">
            <li>✦ A reply within 48 hours with a direction and a price</li>
            <li>✦ Hero film + end-state + secondary routes + mobile edit</li>
            <li>✦ Source code handed over, one config file to edit</li>
          </ul>
          <p className="mt-8 text-[13px] text-dim">Prefer to do it yourself? <Link href="/skill" className="text-aurora hover:underline">Get the skill for $10 →</Link></p>
        </div>
        <div className="panel !rounded-[28px] p-6 sm:p-8">
          {done ? (
            <div className="py-10 text-center"><div className="text-5xl text-aurora">✦</div><h2 className="h-display mt-4 text-3xl">Received.</h2><p className="mx-auto mt-3 max-w-[320px] text-dim">Thanks — I'll reply by email within 48 hours.</p><Link href="/skill" className="btn btn-ghost mt-8">Explore the skill</Link></div>
          ) : (
            <RequestForm onDone={() => setDone(true)} />
          )}
        </div>
      </div>
    </main>
  );
}
