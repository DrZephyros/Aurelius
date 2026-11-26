import { buildSinglePrompt } from "@/lib/skill";

export const dynamic = "force-static";

/** The whole AURA skill compiled into ONE markdown file — any agent with web access can `fetch` this URL and follow it. */
export function GET() {
  return new Response(buildSinglePrompt(), {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=300",
      "access-control-allow-origin": "*",
    },
  });
}
