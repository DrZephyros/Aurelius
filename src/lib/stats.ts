/* Counters live in localStorage — there is no server in this build. */
const KEY = "aurelius:stats:v1";

export type Stat = { downloads: number; promptCopies: number };

function load(): Record<string, Stat> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, Stat>;
  } catch {
    return {};
  }
}

export function getStats(): Record<string, Stat> {
  return load();
}

export function bump(slug: string, kind: "download" | "prompt") {
  try {
    const all = load();
    const cur = all[slug] ?? { downloads: 0, promptCopies: 0 };
    if (kind === "download") cur.downloads += 1;
    else cur.promptCopies += 1;
    all[slug] = cur;
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* counters are best-effort */
  }
}

export function saveRequest(idea: string, email: string | null) {
  try {
    const all = JSON.parse(localStorage.getItem("aurelius:requests:v1") || "[]") as unknown[];
    all.push({ idea, email, at: new Date().toISOString() });
    localStorage.setItem("aurelius:requests:v1", JSON.stringify(all));
  } catch {
    /* ignore */
  }
}
