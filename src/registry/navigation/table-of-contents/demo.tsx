"use client";

import { TableOfContents } from "./table-of-contents";

const SECTIONS: [string, string, [string, string][]][] = [
  ["Getting started", "Copy the file, import it, done. The outline is built from the headings that are already in your article.", [["Install", "No dependencies required — one file, plain React."], ["Usage", "Drop <TableOfContents /> in a sticky sidebar next to your article."]]],
  ["Configuration", "Everything is a prop: which headings to list, where to look, and how far to offset a sticky header.", [["Theming", "Colour comes from the --au-accent CSS variable, so it follows your brand."], ["Accessibility", "A real nav landmark with aria-current on the active entry."]]],
  ["Going further", "It works inside inner scroll areas too — like this one — not just on the page itself.", [["Recipes", "Docs sidebar, long-form blog posts, changelogs, legal pages."]]],
];

/** The article scrolls on its own, so every entry has somewhere to go: click one, or scroll and watch the spy follow. */
export default function Demo() {
  return (
    <div style={{ display: "flex", gap: 36, width: "100%", maxWidth: 680, alignItems: "flex-start" }}>
      <article id="au-demo-article" style={{ flex: 1, height: 340, overflowY: "auto", paddingRight: 14, fontSize: 14, opacity: 0.88, lineHeight: 1.65 }}>
        {SECTIONS.map(([h2, p, subs]) => (
          <section key={h2} style={{ marginBottom: 26 }}>
            <h2 style={{ fontWeight: 600, fontSize: 19, letterSpacing: "-0.02em", margin: "0 0 6px" }}>{h2}</h2>
            <p style={{ margin: "0 0 12px", opacity: 0.8 }}>{p}</p>
            {subs.map(([h3, t]) => (
              <div key={h3} style={{ marginBottom: 14 }}>
                <h3 style={{ fontWeight: 600, margin: "0 0 3px" }}>{h3}</h3>
                <p style={{ margin: 0, opacity: 0.75 }}>{t} Lorem ipsum dolor sit amet, consectetur adipiscing elit — sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam.</p>
              </div>
            ))}
          </section>
        ))}
        <div style={{ height: 120 }} />
      </article>
      <TableOfContents root="#au-demo-article" style={{ width: 180, flexShrink: 0 }} />
    </div>
  );
}
