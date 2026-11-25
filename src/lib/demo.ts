import { VENDOR, readShared, readSource } from "./files";

/* The demos are real multi-file projects (index.html + style.css + main.js + shared engine + vendored three.js).
   The app ships as ONE html file, so at runtime we assemble each demo into a self-contained document:
   vendored modules become blob: URLs wired together through an import map, CSS/JS are inlined. */

/* Opened straight from disk (file://) the page has an opaque origin and blob: URLs are blocked,
   so there we fall back to data: URLs + srcdoc. Over http(s) we use blob: URLs. */
export const FILE_MODE = typeof location !== "undefined" && location.protocol === "file:";
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

/* Card previews auto-play like a trailer. The host can take over the page:
     postMessage({ md: "scrub", p: 0..1 })  → glide the scroll position to that point (eased here, frame by frame,
                                              so the page *slides* instead of stepping); p = null hands control back
                                              and the auto-play is blended in over ~1s with no jump.
     postMessage({ md: "pointer", x, y })   → synthesises hover (0..1 of the viewport) so cursor effects react. */
export const PREVIEW_BRIDGE = `(function(){var o=window.scrollTo.bind(window),root=document.documentElement,tgt=null,cur=0,rel=1,last=performance.now();
function max(){return Math.max(1,root.scrollHeight-innerHeight)}
function go(y){o({left:0,top:y,behavior:'instant'})}
window.scrollTo=function(a,b){if(a&&typeof a==='object'){b=a.top;a=a.left}
if(tgt!==null)return;
if(rel<1){rel=Math.min(1,rel+.018);var e=rel*rel*(3-2*rel),y=cur+(b-cur)*e;go(y);if(rel>=1)cur=b;return}
cur=b;o(a,b)};
function loop(t){var dt=Math.min(.05,(t-last)/1000);last=t;
if(tgt!==null){var want=tgt*max();cur+=(want-cur)*(1-Math.exp(-dt*8));if(Math.abs(want-cur)<.4)cur=want;go(cur)}
requestAnimationFrame(loop)}
requestAnimationFrame(loop);
/* tell the host whether this page actually scrolls — the host only shows its scrub slider when it does */
var sent=null;function report(){var s=root.scrollHeight-innerHeight>60;if(s!==sent){sent=s;try{parent.postMessage({md:'metrics',scrollable:s},'*')}catch(_){}}}
report();setInterval(report,900);addEventListener('load',report);addEventListener('resize',report);
function fire(x,y){var X=x*innerWidth,Y=y*innerHeight,el=document.elementFromPoint(X,Y)||document.body;
['pointermove','mousemove'].forEach(function(n){var C=n==='pointermove'&&window.PointerEvent?PointerEvent:MouseEvent;
try{el.dispatchEvent(new C(n,{bubbles:true,clientX:X,clientY:Y,pointerType:'mouse',view:window}))}catch(_){}})}
addEventListener('message',function(e){var d=e.data;if(!d)return;
if(d.md==='scrub'){if(typeof d.p==='number'){if(tgt===null)cur=window.scrollY;tgt=Math.min(1,Math.max(0,d.p));rel=0}
else if(tgt!==null){tgt=null;rel=0}}
else if(d.md==='pointer')fire(d.x,d.y)})})();`;

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
  const out = query.includes("embed=card") ? html.replace("</head>", () => `<script>${PREVIEW_BRIDGE}</script></head>`) : html;
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
