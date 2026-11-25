import { VENDOR, readShared, readSource } from "./files";

/* The demos are real multi-file projects (index.html + style.css + main.js + shared engine + vendored three.js).
   The app ships as ONE html file, so at runtime we assemble each demo into a self-contained document:
   vendored modules become blob: URLs wired together through an import map, CSS/JS are inlined. */

/* Opened straight from disk (file://) the page has an opaque origin and blob: URLs are blocked,
   so there we fall back to data: URLs + srcdoc. Over http(s) we use blob: URLs. */
const FILE_MODE = typeof location !== "undefined" && location.protocol === "file:";
const mk = (code: string): string =>
  FILE_MODE ? "data:text/javascript;charset=utf-8," + encodeURIComponent(code) : URL.createObjectURL(new Blob([code], { type: "text/javascript" }));

let vendorMap: Record<string, string> | null = null;

/** blob: URL for every vendored module, keyed by its bare import specifier. */
function vendorImports(): Record<string, string> {
  if (vendorMap) return vendorMap;
  const map: Record<string, string> = {};
  const spec = (rel: string) => (rel === "three.module.min.js" ? "three" : "three/addons/" + rel.replace(/^addons\//, ""));
  for (const [rel, code] of Object.entries(VENDOR)) {
    const dir = rel.split("/").slice(0, -1);
    // rewrite relative imports between add-ons into bare specifiers (blob: URLs can't resolve relatives)
    const fixed = code.replace(/(from\s*|import\s*)(['"])(\.{1,2}\/[^'"]+)\2/g, (_m, kw: string, q: string, rp: string) => {
      const parts = [...dir];
      for (const seg of rp.split("/")) {
        if (seg === "..") parts.pop();
        else if (seg !== ".") parts.push(seg);
      }
      return `${kw}${q}${spec(parts.join("/"))}${q}`;
    });
    map[spec(rel)] = mk(fixed);
  }
  vendorMap = map;
  return map;
}

/* Card previews auto-play like a trailer. The gallery can also take over the scroll position:
   postMessage({ md: "scrub", p: 0..1 }) pins the page to that point (smoothed by the template's own
   scroll damping); p = null hands control back to the auto-play. */
const SCRUB_BRIDGE = `(function(){var s=null,o=window.scrollTo.bind(window);
window.scrollTo=function(a,b){if(s===null)return o(a,b);var m=Math.max(1,document.documentElement.scrollHeight-innerHeight);return o(0,s*m)};
addEventListener('message',function(e){var d=e.data;if(d&&d.md==='scrub')s=typeof d.p==='number'?Math.min(1,Math.max(0,d.p)):null});})();`;

const coreCache = new Map<string, string>();
const docCache = new Map<string, string>();
const htmlCache = new Map<string, string>();

function coreUrl(query: string): string {
  let u = coreCache.get(query);
  if (!u) {
    // core.js reads location.search for ?embed=… and ?period=… — a blob: page has none, so bake it in.
    const code = readShared("core.js").replace("new URLSearchParams(location.search)", `new URLSearchParams(${JSON.stringify(query)})`);
    u = mk(code);
    coreCache.set(query, u);
  }
  return u;
}

/** The assembled, self-contained html document for a demo. `query` is e.g. "embed=card" or "embed=bg&period=60". */
export function demoHtml(slug: string, query = ""): string {
  const key = slug + "?" + query;
  const hit = htmlCache.get(key);
  if (hit) return hit;
  const importmap = JSON.stringify({ imports: { ...vendorImports(), "@core": coreUrl(query) } });
  const html = readSource(slug, "index.html")
    .replace(/<link rel="stylesheet" href="\.\.\/_shared\/base\.css"\s*\/?>/, () => `<style>${readShared("base.css")}</style>`)
    .replace(/<link rel="stylesheet" href="\.\/style\.css"\s*\/?>/, () => `<style>${readSource(slug, "style.css")}</style>`)
    .replace(/<script type="importmap">[\s\S]*?<\/script>/, () => `<script type="importmap">${importmap}</script>`)
    .replace(/<script type="module" src="\.\/main\.js"><\/script>/, () => `<script type="module">\n${readSource(slug, "main.js").replace(/<\/script/g, "<\\/script")}\n</script>`);
  const out = query.includes("embed=card") ? html.replace("</head>", () => `<script>${SCRUB_BRIDGE}</script></head>`) : html;
  htmlCache.set(key, out);
  return out;
}

/** blob: URL of a demo (http/https only). */
export function demoUrl(slug: string, query = ""): string {
  const key = slug + "?" + query;
  let url = docCache.get(key);
  if (!url) {
    url = URL.createObjectURL(new Blob([demoHtml(slug, query)], { type: "text/html" }));
    docCache.set(key, url);
  }
  return url;
}

/** Props to spread on an <iframe> — works from file:// and from a server. */
export function frameProps(slug: string, query = ""): { src: string } | { srcDoc: string } {
  return FILE_MODE ? { srcDoc: demoHtml(slug, query) } : { src: demoUrl(slug, query) };
}

/** Open a demo full-screen in a new tab. */
export function openDemo(slug: string) {
  if (!FILE_MODE) {
    window.open(demoUrl(slug), "_blank");
    return;
  }
  const w = window.open("", "_blank");
  if (w) {
    w.document.open();
    w.document.write(demoHtml(slug));
    w.document.close();
  }
}
