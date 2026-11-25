import { bySlug } from "@/lib/templates";
import { buildZip } from "@/lib/zip";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const t = bySlug(slug);
  if (!t) return new Response("Not found", { status: 404 });
  const blob = await buildZip(t);
  return new Response(await blob.arrayBuffer(), {
    headers: { "content-type": "application/zip", "content-disposition": `attachment; filename="${t.slug}-3d-template.zip"` },
  });
}
