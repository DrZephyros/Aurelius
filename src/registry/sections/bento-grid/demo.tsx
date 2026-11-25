"use client";

import { BentoGrid } from "./bento-grid";

const v = (g: string) => <div style={{ width: "70%", height: "60%", borderRadius: 18, background: g, opacity: 0.8, filter: "blur(.3px)" }} />;

export default function Demo() {
  return (
    <div style={{ width: "100%", maxWidth: 760 }}>
      <BentoGrid
        style={{ gridAutoRows: "minmax(140px,auto)" }}
        items={[
          { title: "Lightning fast", description: "Edge-rendered, zero layout shift.", icon: "⚡", size: "lg", visual: v("linear-gradient(135deg,#3de7ff55,#a58bff55)") },
          { title: "Secure by default", description: "Row-level security out of the box.", icon: "🔒" },
          { title: "Typed end-to-end", icon: "🧩", description: "From database to button." },
          { title: "Ship on Fridays", description: "Preview deploys for every pull request.", icon: "🚀", size: "wide" },
        ]}
      />
    </div>
  );
}
