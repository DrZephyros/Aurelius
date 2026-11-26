import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { skillOrders } from "@/db/schema";
import { singleFile, zipFor } from "@/lib/skill-server";

export const dynamic = "force-dynamic";

/** Token-gated delivery of the skill. kind = skill (installable folder) | starter (engine only) | single (one-file markdown). */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const token = u.searchParams.get("token") ?? "";
  const kind = u.searchParams.get("kind") ?? "skill";
  const [order] = token ? await db.select().from(skillOrders).where(eq(skillOrders.token, token)).limit(1) : [];
  if (!order || (order.status !== "paid" && order.status !== "preview")) return new Response("Not authorised", { status: 403 });
  await db.update(skillOrders).set({ downloads: sql`${skillOrders.downloads} + 1` }).where(eq(skillOrders.id, order.id));

  if (kind === "single") {
    return new Response(singleFile(), {
      headers: { "content-type": "text/markdown; charset=utf-8", "content-disposition": 'attachment; filename="aura-3d-web.single-file.md"' },
    });
  }
  const bytes = await zipFor(kind === "starter" ? "starter" : "skill");
  return new Response(bytes as BodyInit, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename="${kind === "starter" ? "aura-starter" : "aura-3d-web"}.zip"`,
    },
  });
}
