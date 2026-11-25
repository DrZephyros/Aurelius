/* The 3D templates are plain static projects in public/demos/<slug>/ — they are served as-is and previewed in iframes.
   Query modes understood by public/demos/_shared/core.js:
     ?embed=card    auto-playing thumbnail (low-res, ping-pong scroll)
     ?embed=bg      ambient hero backdrop
     ?embed=scroll  full quality, driven by the host page's scroll (used by the landing page specimens)
   The host can take over an embed=card / embed=scroll page with postMessage — see PREVIEW_BRIDGE. */

export const demoPath = (slug: string, query = ""): string => `/demos/${slug}/index.html${query ? "?" + query : ""}`;

/** Props to spread on an <iframe>. */
export function frameProps(slug: string, query = ""): { src: string } {
  return { src: demoPath(slug, query) };
}

/** Open a demo full-screen in a new tab. */
export function openDemo(slug: string) {
  window.open(demoPath(slug), "_blank");
}

/* Injected into the single-file app pages / elements so previews can be scrubbed.
     postMessage({ md: "scrub", p: 0..1 })  → glide the scroll position to that point (eased frame by frame);
                                              p = null hands control back and the auto-play is blended in over ~1s.
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
function fire(x,y){var X=x*innerWidth,Y=y*innerHeight,el=document.elementFromPoint(X,Y)||document.body;
['pointermove','mousemove'].forEach(function(n){var C=n==='pointermove'&&window.PointerEvent?PointerEvent:MouseEvent;
try{el.dispatchEvent(new C(n,{bubbles:true,clientX:X,clientY:Y,pointerType:'mouse',view:window}))}catch(_){}})}
addEventListener('message',function(e){var d=e.data;if(!d)return;
if(d.md==='scrub'){if(typeof d.p==='number'){if(tgt===null)cur=window.scrollY;tgt=Math.min(1,Math.max(0,d.p));rel=0}
else if(tgt!==null){tgt=null;rel=0}}
else if(d.md==='pointer')fire(d.x,d.y)})})();`;
