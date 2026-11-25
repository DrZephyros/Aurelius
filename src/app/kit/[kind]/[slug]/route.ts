import fs from "node:fs";
import path from "node:path";
import { PREVIEW_BRIDGE } from "@/lib/demo";

/* Serves the single-file app pages / elements from kit-src/.
   ?embed=card injects the scrub bridge · ?download=1 sets an attachment filename. */
export async function GET(req: Request, ctx: { params: Promise<{ kind: string; slug: string }> }) {
  const { kind, slug } = await ctx.params;
  if (!/^[\w-]+$/.test(slug) || (kind !== "page" && kind !== "element")) return new Response("Not found", { status: 404 });
  const file = path.join(process.cwd(), "kit-src", kind === "page" ? "pages" : "elements", slug + ".html");
  if (!fs.existsSync(file)) return new Response("Not found", { status: 404 });
  let html = fs.readFileSync(file, "utf8");
  const q = new URL(req.url).searchParams;
  const headers: Record<string, string> = { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=300" };
  if (q.get("download")) headers["content-disposition"] = `attachment; filename="${slug}-${kind}.html"`;
  else if (q.get("embed") === "card") {
    const tag = `<script>${PREVIEW_BRIDGE}</script>`;
    html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + tag) : tag + html;
  }
  return new Response(html, { headers });
}
