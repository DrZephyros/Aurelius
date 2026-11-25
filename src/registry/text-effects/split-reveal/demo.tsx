"use client";

import { useState } from "react";
import { SplitReveal } from "./split-reveal";

export default function Demo() {
  const [n, setN] = useState(0);
  return (
    <div className="text-center">
      <SplitReveal key={"a" + n} as="h2" text="Words arrive one by one." style={{ fontSize: "clamp(2rem,6vw,3.6rem)", fontWeight: 600, letterSpacing: "-0.04em" }} />
      <div style={{ marginTop: 14 }}><SplitReveal key={"b" + n} by="char" stagger={24} text="…or letter by letter, from a blur." style={{ fontSize: 18, opacity: 0.7 }} /></div>
      <button onClick={() => setN(n + 1)} style={{ marginTop: 22, fontSize: 12, opacity: 0.6, textDecoration: "underline" }}>replay</button>
    </div>
  );
}
