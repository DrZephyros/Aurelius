"use client";

import { TableOfContents } from "./table-of-contents";

export default function Demo() {
  return (
    <div style={{ display: "flex", gap: 40, width: "100%", maxWidth: 620, alignItems: "flex-start" }}>
      <article id="au-demo-article" style={{ flex: 1, height: 260, overflow: "hidden", fontSize: 14, opacity: 0.8, lineHeight: 1.6 }}>
        <h2 style={{ fontWeight: 600, fontSize: 18 }}>Getting started</h2><p>Copy the file, import it, done.</p>
        <h3 style={{ fontWeight: 600 }}>Install</h3><p>No dependencies required.</p>
        <h2 style={{ fontWeight: 600, fontSize: 18, marginTop: 8 }}>Configuration</h2><p>Everything is a prop.</p>
        <h3 style={{ fontWeight: 600 }}>Theming</h3><p>CSS variables.</p>
      </article>
      <TableOfContents root="#au-demo-article" style={{ width: 190 }} />
    </div>
  );
}
