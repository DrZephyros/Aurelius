import { db } from "@/db";
import { siteRequests } from "@/db/schema";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const name = clip(b.name, 120), email = clip(b.email, 200).toLowerCase(), brief = clip(b.brief, 5000);
  if (!name) return Response.json({ error: "Tell me your name." }, { status: 400 });
  if (!EMAIL.test(email)) return Response.json({ error: "That email doesn't look right." }, { status: 400 });
  if (brief.length < 20) return Response.json({ error: "Give me a few sentences about the project (20+ characters)." }, { status: 400 });
  const [row] = await db
    .insert(siteRequests)
    .values({ name, email, brief, company: clip(b.company, 160) || null, kind: clip(b.kind, 200) || null, budget: clip(b.budget, 80) || null, timeline: clip(b.timeline, 80) || null, links: clip(b.links, 1000) || null })
    .returning({ id: siteRequests.id })
    .catch((e: unknown) => {
      // No database on this deployment — answer in JSON so the form can show something useful.
      console.error("[api/requests]", e);
      throw new Response(JSON.stringify({ error: "Requests are offline right now — email me directly and I'll reply within a day." }), {
        status: 503,
        headers: { "content-type": "application/json" },
      });
    });
  return Response.json({ ok: true, id: row.id });
}
