import { serveLibrary } from "@/lib/agent-serve";

export const dynamic = "force-dynamic";

/* The conventional agent entry point: GET /llms.txt — same index as GET /library, at the short URL
   most people paste into Claude Code, Cursor or Codex. */
export function GET(req: Request) {
  return serveLibrary(req, []);
}
