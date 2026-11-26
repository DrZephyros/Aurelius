import { randomBytes } from "node:crypto";
import { db } from "@/db";
import { agentLinks } from "@/db/schema";

export const dynamic = "force-dynamic";

/** Issue a private agent link. The URL is the credential — paste it into any AI agent to give it the whole free library.
    Optional: the public link (GET /library) needs no database at all. */
export async function POST(req: Request) {
  const token = "au_" + randomBytes(14).toString("hex");
  try {
    await db.insert(agentLinks).values({ token });
  } catch (e) {
    console.error("[api/agent-link]", e);
    return Response.json({ error: "Private links need a database — use the public link instead." }, { status: 503 });
  }
  const origin = req.headers.get("x-forwarded-host") ? `${req.headers.get("x-forwarded-proto") ?? "https"}://${req.headers.get("x-forwarded-host")}` : new URL(req.url).origin;
  const url = `${origin}/agent/${token}`;
  return Response.json({
    url,
    prompt: `I'm giving you access to the Aurelius library, a free collection of 3D landing pages, React components, app pages and prompts.\n\nRead this first: ${url}\n\nThen, for the site I'm building, fetch only the items from that index that fit (each link returns full source plus usage notes), adapt them to my brand and brief, and tell me which ones you used.`,
  });
}
