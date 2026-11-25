import { zipAll, zipCategory, zipItem } from "@/lib/registry-server";
import { zipName } from "@/lib/registry";

export const dynamic = "force-dynamic";

/** GET /api/registry/download                         → everything
    GET /api/registry/download?category=text-effects   → one category
    GET /api/registry/download?category=…&slug=…       → one component */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const category = q.get("category") ?? undefined;
  const slug = q.get("slug") ?? undefined;
  if ((category && !/^[\w-]+$/.test(category)) || (slug && !/^[\w-]+$/.test(slug))) return new Response("Bad request", { status: 400 });
  const data = slug && category ? await zipItem(category, slug) : category ? await zipCategory(category) : await zipAll();
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(data as unknown as BodyInit, {
    headers: { "content-type": "application/zip", "content-disposition": `attachment; filename="${zipName(category, slug)}"` },
  });
}
