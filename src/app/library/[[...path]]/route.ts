import { serveLibrary } from "@/lib/agent-serve";

export const dynamic = "force-dynamic";

/* The public agent library — no token, no database, no signup.
   GET /library                          → the index (markdown)
   GET /library/templates/<slug>         → one template, full source
   GET /library/components/<cat>/<slug>  → one component, source + README
   GET /library/pages/<slug>             → one app page, full html
   GET /library/elements/<slug>          → one element, full html
   GET /library/prompts                  → the prompt pack
   GET /library/skill/<which>            → free skill samples */

export async function GET(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await ctx.params;
  const accept = req.headers.get("accept") ?? "";
  // a browser opening /library gets the app's Library page (the same client shell every route uses); agents keep the markdown index
  if (path.length === 0 && accept.includes("text/html") && !accept.includes("text/markdown")) {
    const shell = await fetch(new URL("/", req.url));
    return new Response(shell.body, { status: shell.status, headers: { "content-type": "text/html; charset=utf-8" } });
  }
  return serveLibrary(req, path);
}
