import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { agentLinks } from "@/db/schema";
import { componentMarkdown, indexMarkdown, kitMarkdown, promptsMarkdown, skillSampleMarkdown, templateMarkdown } from "@/lib/agent-library";

export const dynamic = "force-dynamic";

const text = (body: string, status = 200) =>
  new Response(body, { status, headers: { "content-type": "text/markdown; charset=utf-8", "cache-control": "private, max-age=300", "x-robots-tag": "noindex" } });

/** GET /agent/<token>            → the library index (markdown)
 *  GET /agent/<token>/<kind>/…   → one item with its full source: templates/<slug> · components/<cat>/<slug> · pages/<slug> · elements/<slug> · prompts · skill/<doctrine|prompt-pack|example> */
export async function GET(req: Request, ctx: { params: Promise<{ token: string; path?: string[] }> }) {
  const { token, path = [] } = await ctx.params;
  const rows = await db.update(agentLinks).set({ hits: sql`${agentLinks.hits} + 1`, lastUsedAt: new Date() }).where(eq(agentLinks.token, token)).returning({ id: agentLinks.id });
  if (!rows.length) return text("# Link not found\n\nThis agent link is invalid. Issue a fresh one on the Aurelius library page.\n", 404);

  const fwd = req.headers.get("x-forwarded-host");
  const origin = fwd ? `${req.headers.get("x-forwarded-proto") ?? "https"}://${fwd}` : new URL(req.url).origin;
  const base = `${origin}/agent/${token}`;
  const [kind, a, b] = path;
  let out: string | null;
  if (!kind) out = indexMarkdown(base);
  else if (kind === "templates" && a) out = templateMarkdown(a);
  else if (kind === "components" && a && b) out = componentMarkdown(a, b);
  else if (kind === "pages" && a) out = kitMarkdown("pages", a);
  else if (kind === "elements" && a) out = kitMarkdown("elements", a);
  else if (kind === "prompts") out = promptsMarkdown();
  else if (kind === "skill" && a) out = skillSampleMarkdown(a);
  else out = null;
  return out ? text(out) : text(`# Not found\n\nNo such library item. Start again from the index: ${base}\n`, 404);
}
