import "server-only";
import JSZip from "jszip";
import RAW from "@/generated/raw-skill";

/* SERVER ONLY. The full AURA skill — assembled from /skill-src/aura-3d-web for paying customers. */
const SLUG = "aura-3d-web";
const PREFIX = `/skill-src/${SLUG}/`;

export const files = () =>
  Object.entries(RAW)
    .filter(([k]) => k.startsWith(PREFIX))
    .map(([k, code]) => ({ path: k.slice(PREFIX.length), code }))
    .sort((a, b) => a.path.localeCompare(b.path));

const strip = (md: string) => md.replace(/^---\n[\s\S]*?\n---\n/, "").trim();

export function singleFile(): string {
  const fs = files();
  const get = (p: string) => fs.find((f) => f.path === p)?.code ?? "";
  const parts: string[] = [
    `# AURA — immersive 3D website skill (single-file edition)\n\nYou are about to receive a complete operating manual for designing and building AAA-grade, scroll-driven, immersive 3D websites. Read ALL of it before writing code. Follow the pipeline in order. Everything below is one document: SKILL.md first, then the references, the worked examples, the templates and the starter engine source.`,
  ];
  const doc = (p: string) => parts.push(`\n\n${"=".repeat(72)}\n# FILE: ${p}\n${"=".repeat(72)}\n\n${p === "SKILL.md" ? strip(get(p)) : get(p).trim()}`);
  doc("SKILL.md");
  ["references/", "examples/", "templates/"].forEach((g) => fs.filter((f) => f.path.startsWith(g) && f.path.endsWith(".md")).forEach((f) => doc(f.path)));
  parts.push(`\n\n${"=".repeat(72)}\n# STARTER ENGINE SOURCE (copy these files into src/aura/)\n${"=".repeat(72)}`);
  fs.filter((f) => f.path.startsWith("starter/src/aura/")).forEach((f) => {
    const lang = f.path.endsWith(".css") ? "css" : f.path.endsWith(".tsx") ? "tsx" : "ts";
    parts.push(`\n\n## ${f.path}\n\`\`\`${lang}\n${f.code.trim()}\n\`\`\``);
  });
  return parts.join("\n") + "\n";
}

export async function zipFor(kind: "skill" | "starter"): Promise<Uint8Array> {
  const zip = new JSZip();
  const fs = files();
  if (kind === "skill") {
    const root = zip.folder(SLUG)!;
    fs.forEach((f) => root.file(f.path, f.code));
  } else {
    const root = zip.folder("aura-starter")!;
    fs.filter((f) => f.path.startsWith("starter/")).forEach((f) => root.file(f.path.replace(/^starter\//, ""), f.code));
    root.file("scripts/audit.mjs", fs.find((f) => f.path === "scripts/audit.mjs")?.code ?? "");
  }
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}
