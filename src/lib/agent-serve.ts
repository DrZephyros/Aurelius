import {
  indexMarkdown,
  templateMarkdown,
  componentMarkdown,
  kitMarkdown,
  promptsMarkdown,
  skillSampleMarkdown,
} from "./agent-library";

/* Serves the free library as plain markdown for AI agents — no token, no database, no signup.
   Used by GET /library/** and GET /llms.txt. */

export function markdown(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=600",
      "access-control-allow-origin": "*",
    },
  });
}

export function originOf(req: Request): string {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) return new URL(req.url).origin;
  return `${req.headers.get("x-forwarded-proto") ?? "https"}://${host}`;
}

/** path: [] → index · templates/<slug> · components/<cat>/<slug> · pages/<slug> · elements/<slug> · prompts · skill/<which> */
export function serveLibrary(req: Request, path: string[] = []): Response {
  const base = `${originOf(req)}/library`;
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

  return out ? markdown(out) : markdown(`# Not found\n\nNo such library item. Start from the index: ${base}\n`, 404);
}
