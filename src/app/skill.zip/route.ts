import JSZip from "jszip";
import { SKILL_FILES, SKILL_SLUG } from "@/lib/skill";

export const dynamic = "force-static";

/** The installable skill folder (SKILL.md + references + templates + scripts + starter) — `curl -L …/skill.zip -o aura.zip && unzip aura.zip -d ~/.claude/skills/` */
export async function GET() {
  const zip = new JSZip();
  const root = zip.folder(SKILL_SLUG)!;
  SKILL_FILES.forEach((f) => root.file(f.path, f.code));
  const bytes = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  return new Response(bytes as BodyInit, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${SKILL_SLUG}.zip"`,
      "cache-control": "public, max-age=300",
      "access-control-allow-origin": "*",
    },
  });
}
