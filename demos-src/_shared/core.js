/* ───────────────────────────────────────────────────────────────
   AURELIUS · shared 3D engine
   Renderer + bloom + film post-fx, scroll rail, pointer, loader,
   annotation labels and a few GLSL helpers.
   Every template imports this file. Read it once, remix freely.
   ─────────────────────────────────────────────────────────────── */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

export { THREE };

/* ── embed mode (used by the gallery thumbnails) ─────────────── */
const qs = new URLSearchParams(location.search);
export const EMBED = qs.get('embed'); // "card" | "bg" | "scroll" | null
/* "scroll" = hosted inside the Aurelius site and driven by the parent page's scroll position: full quality, no autoplay */
export const IS_EMBED = !!EMBED && EMBED !== 'scroll';
if (IS_EMBED) document.documentElement.classList.add('embed', 'embed-' + EMBED);
if (EMBED === 'scroll') document.documentElement.classList.add('embed-scroll');
/* host-page signalling (landing specimens): the host can pause the render loop while the world is far off-screen
   ({md:'pause',on}), and is told once the world has rendered and faded in ({md:'ready'}) so it can be warmed up ahead of the scroll */
if (EMBED) {
  addEventListener('message', (e) => {
    const d = e.data;
    if (d && d.md === 'pause') window.__paused = !!d.on;
  });
}
const tellHost = (m) => {
  try { if (EMBED && parent !== window) parent.postMessage(m, '*'); } catch (_) { /* ignore */ }
};
/* parent-page bridge: postMessage({md:'scrub',p}) glides the scroll position, postMessage({md:'pointer',x,y}) fakes hover */
if (EMBED === 'card' || EMBED === 'scroll') {
  const s = document.createElement('script');
  s.textContent = `(function(){var o=window.scrollTo.bind(window),root=document.documentElement,tgt=null,cur=0,rel=1,last=performance.now();
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
  document.head.appendChild(s);
}

/* ── math helpers ────────────────────────────────────────────── */
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ── GLSL helpers ────────────────────────────────────────────── */
export const GLSL_NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.); const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.; vec4 s1=floor(b1)*2.+1.; vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.); m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*snoise(p);p=p*2.02+vec3(1.7,9.2,3.1);a*=.5;}return s;}
`;

/* ── stage: renderer + camera + post-processing ──────────────── */
const FX_SHADER = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uGrain: { value: 0.045 },
    uVignette: { value: 0.6 },
    uAberration: { value: 0.03 },
    uFade: { value: 0 },
  },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: /* glsl */ `
    varying vec2 vUv; uniform sampler2D tDiffuse; uniform float uTime,uGrain,uVignette,uAberration,uFade;
    float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
    void main(){
      vec2 c=vUv-.5; float d=dot(c,c);
      vec2 off=c*d*uAberration;
      vec3 col=vec3(texture2D(tDiffuse,vUv+off).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-off).b);
      col*=1.-smoothstep(.08,.5,d)*uVignette;
      col+=(hash(vUv*vec2(1920.,1080.)+fract(uTime)*91.)-.5)*uGrain;
      gl_FragColor=vec4(col*uFade,1.);
    }`,
};

export function createStage(o = {}) {
  const canvas = o.canvas || document.getElementById('webgl');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  const dpr = Math.min(window.devicePixelRatio || 1, IS_EMBED ? 1 : o.maxDpr ?? 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = o.exposure ?? 1;
  renderer.setClearColor(o.background ?? 0x000000, 1);

  const scene = new THREE.Scene();
  if (o.background !== undefined) scene.background = new THREE.Color(o.background);
  if (o.fog) scene.fog = new THREE.FogExp2(o.fog.color, o.fog.density);
  const camera = new THREE.PerspectiveCamera(o.fov ?? 45, innerWidth / innerHeight, o.near ?? 0.1, o.far ?? 600);

  const rt = new THREE.WebGLRenderTarget(innerWidth, innerHeight, {
    type: THREE.HalfFloatType,
    samples: IS_EMBED ? 0 : 4,
  });
  const composer = new EffectComposer(renderer, rt);
  composer.setPixelRatio(dpr);
  composer.setSize(innerWidth, innerHeight);
  composer.addPass(new RenderPass(scene, camera));
  let bloom = null;
  if (o.bloom !== false) {
    const b = o.bloom || {};
    bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), b.strength ?? 0.8, b.radius ?? 0.6, b.threshold ?? 0.2);
    composer.addPass(bloom);
  }
  composer.addPass(new OutputPass());
  const fx = new ShaderPass(FX_SHADER);
  if (o.grain !== undefined) fx.uniforms.uGrain.value = o.grain;
  if (o.vignette !== undefined) fx.uniforms.uVignette.value = o.vignette;
  if (o.aberration !== undefined) fx.uniforms.uAberration.value = o.aberration;
  composer.addPass(fx);

  const hooks = [];
  const clock = new THREE.Clock();
  let first = true;
  let told = false;
  function frame() {
    requestAnimationFrame(frame);
    if (window.__paused && !first) { clock.getDelta(); return; } // parked off-screen by the host page
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    for (const h of hooks) h(dt, t);
    fx.uniforms.uTime.value = t;
    const ra = window.__readyAt;
    fx.uniforms.uFade.value = IS_EMBED ? 1 : ra ? clamp((performance.now() - ra) / 1800) : 0;
    composer.render(dt);
    if (first) {
      first = false;
      document.documentElement.classList.add('gl-ok');
    }
    if (!told && !first && fx.uniforms.uFade.value >= 1) {
      told = true;
      tellHost({ md: 'ready' });
    }
  }

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    composer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  addEventListener('resize', resize);

  return { renderer, scene, camera, composer, bloom, fx, onFrame: (fn) => hooks.push(fn), start: frame, dpr };
}

/* ── pointer (smoothed −1..1) ────────────────────────────────── */
export function createPointer() {
  const p = { x: 0, y: 0, tx: 0, ty: 0, rx: innerWidth / 2, ry: innerHeight / 2 };
  addEventListener('pointermove', (e) => {
    p.rx = e.clientX;
    p.ry = e.clientY;
    p.tx = (e.clientX / innerWidth) * 2 - 1;
    p.ty = -((e.clientY / innerHeight) * 2 - 1);
  });
  p.update = (dt, t) => {
    if (IS_EMBED) {
      p.tx = Math.sin(t * 0.5) * 0.5;
      p.ty = Math.cos(t * 0.37) * 0.25;
    }
    p.x = damp(p.x, p.tx, 4, dt);
    p.y = damp(p.y, p.ty, 4, dt);
  };
  return p;
}

/* ── scroll (smoothed 0..1, plus section tracking) ───────────── */
export function createScroll({ period = 34 } = {}) {
  period = +qs.get('period') || period;
  const root = document.documentElement;
  const s = { progress: 0, target: 0, velocity: 0, active: 0, sections: [...document.querySelectorAll('[data-sec]')] };
  const dots = [...document.querySelectorAll('.dots a')];
  // progress runs from the top of the page to the END OF THE LAST SCENE — the landing footer below it never moves the camera
  const max = () => {
    const last = s.sections[s.sections.length - 1];
    const end = last ? last.getBoundingClientRect().bottom + window.scrollY + 70 : root.scrollHeight;
    return Math.max(1, Math.min(root.scrollHeight, end) - innerHeight);
  };
  s.update = (dt, t) => {
    if (IS_EMBED) {
      // thumbnails: auto-play the page like a trailer (ping-pong)
      const c = (t / period) % 1;
      const tri = c < 0.5 ? c * 2 : 2 - c * 2;
      const e = clamp(tri * 1.16 - 0.08);
      window.scrollTo(0, e * e * (3 - 2 * e) * max());
    }
    s.target = clamp(window.scrollY / max());
    const prev = s.progress;
    s.progress = damp(s.progress, s.target, 5, dt);
    s.velocity = (s.progress - prev) / Math.max(dt, 1e-4);
    root.style.setProperty('--p', s.progress.toFixed(4));
    let best = 0, bd = 1e9;
    s.sections.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - innerHeight / 2);
      if (d < bd) { bd = d; best = i; }
    });
    if (best !== s.active || !dots[0]?.dataset.init) {
      s.active = best;
      dots.forEach((a, i) => { a.classList.toggle('on', i === best); a.dataset.init = 1; });
    }
    return s.progress;
  };
  return s;
}

/* ── camera rail: two Catmull-Rom curves (position + look-at) ── */
export function createRail(positions, targets) {
  const mk = (arr) => new THREE.CatmullRomCurve3(arr.map((v) => new THREE.Vector3(...v)), false, 'catmullrom', 0.5);
  const a = mk(positions), b = mk(targets);
  const look = new THREE.Vector3();
  return {
    apply(camera, p) {
      a.getPoint(clamp(p), camera.position);
      b.getPoint(clamp(p), look);
      camera.lookAt(look);
      return look;
    },
  };
}

/* ── annotation labels: 3D anchor → SVG line → DOM pill ──────── */
export function createLabels(camera, defs) {
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'label-layer');
  document.body.appendChild(svg);
  const items = defs.map((d) => {
    const path = document.createElementNS(NS, 'path');
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('r', '3.5');
    svg.append(path, dot);
    return { ...d, path, dot };
  });
  const v = new THREE.Vector3();
  return {
    update(visibility = 1) {
      svg.style.opacity = visibility;
      for (const it of items) {
        if (it.anchor.isObject3D) it.anchor.getWorldPosition(v); else v.copy(it.anchor);
        v.project(camera);
        const x = (v.x * 0.5 + 0.5) * innerWidth;
        const y = (-v.y * 0.5 + 0.5) * innerHeight;
        const lx = x + it.dx, ly = y + it.dy;
        it.el.style.transform = `translate(${lx}px,${ly}px) translate(${it.dx < 0 ? '-100%' : '0'},-50%)`;
        it.el.style.opacity = v.z > 1 ? 0 : visibility;
        it.path.setAttribute('d', `M${x} ${y} L${lx} ${ly}`);
        it.dot.setAttribute('cx', x);
        it.dot.setAttribute('cy', y);
      }
    },
  };
}

/* ── loader + text reveal ────────────────────────────────────── */
function setupReveal() {
  const split = (node, c) => {
    [...node.childNodes].forEach((ch) => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(' '));
          const o = document.createElement('span');
          o.className = 'w';
          const i = document.createElement('span');
          i.textContent = part;
          i.style.setProperty('--i', c.n++);
          o.appendChild(i);
          frag.appendChild(o);
        });
        ch.replaceWith(frag);
      } else if (ch.nodeType === 1 && ch.tagName !== 'BR') split(ch, c);
    });
  };
  document.querySelectorAll('[data-split]').forEach((el) => split(el, { n: 0 }));
  const io = new IntersectionObserver(
    (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))),
    { threshold: 0.15 }
  );
  document.querySelectorAll('[data-reveal],[data-split]').forEach((el) => io.observe(el));
}

export function runLoader(duration = 1700) {
  return new Promise((resolve) => {
    const el = document.getElementById('loader');
    const bar = el && el.querySelector('.ld-bar i');
    const pct = el && el.querySelector('.ld-pct b');
    const dur = EMBED ? 0 : duration; // the host page shows its own veil while a specimen boots
    const t0 = performance.now();
    const tick = () => {
      const k = dur ? clamp((performance.now() - t0) / dur) : 1;
      const e = 1 - Math.pow(1 - k, 3);
      if (bar) bar.style.transform = `scaleX(${e})`;
      if (pct) pct.textContent = String(Math.round(e * 100)).padStart(3, '0');
      if (k < 1) return requestAnimationFrame(tick);
      el && el.classList.add('done');
      document.body.classList.add('ready');
      window.__readyAt = performance.now();
      setupReveal();
      setTimeout(() => el && el.remove(), 1500);
      resolve();
    };
    tick();
  });
}

/* ── boot wrapper: graceful fallback if WebGL is unavailable ─── */
export function boot(fn) {
  runLoader();
  try {
    fn();
  } catch (err) {
    console.error('[template] WebGL init failed:', err);
    document.documentElement.classList.add('no-webgl');
  }
  if (!IS_EMBED) landingKit();
}

/* ── landing kit ─────────────────────────────────────────────────
   Every template is a landing page, so the shared engine adds the conversion furniture
   a landing page needs — without touching the template's own markup:
   · the nav CTA fills with the accent colour once the visitor scrolls past the hero
   · a sticky CTA bar on phones (the nav links are hidden there)
   · a real footer: brand, link columns, newsletter capture, legal row, back-to-top
   Templates without scroll scenes (e.g. Atrium) opt out automatically. */
function landingKit() {
  const root = document.documentElement;
  if (!document.querySelector('[data-sec]')) return;
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // readable text colour on top of the accent
  const probe = document.createElement('i');
  probe.style.cssText = 'position:fixed;visibility:hidden;color:var(--accent)';
  document.body.appendChild(probe);
  const m = getComputedStyle(probe).color.match(/[\d.]+/g) || [255, 255, 255];
  probe.remove();
  const lum = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
  root.style.setProperty('--on-accent', lum > 0.55 ? '#0b0c0f' : '#ffffff');

  const brandEl = document.querySelector('.nav .brand');
  const brand = brandEl ? brandEl.textContent.trim() : document.title.split(/[—-]/)[0].trim();
  const links = [...document.querySelectorAll('.nav ul a')].map((a) => ({ t: a.textContent.trim(), h: a.getAttribute('href') || '#' }));
  const cta = document.querySelector('.nav .cta');
  const foot = document.querySelector('.foot');
  const spans = foot ? [...foot.querySelectorAll('span')].map((x) => x.textContent.trim()) : [];
  const legal = spans[0] || '© 2026 ' + brand;
  const tagline = spans[1] || '';

  const html = `
    <div class="lp-top">
      <div class="lp-about">
        <div class="lp-brand"><i></i>${esc(brand)}</div>
        ${tagline ? `<p>${esc(tagline)}</p>` : ''}
        <form class="lp-news" novalidate>
          <label for="lp-mail">Get occasional updates</label>
          <div class="lp-field"><input id="lp-mail" type="email" placeholder="you@email.com" autocomplete="email" required /><button type="submit">Subscribe</button></div>
          <small class="lp-msg" role="status"></small>
        </form>
      </div>
      <nav class="lp-col" aria-label="Explore"><h4>Explore</h4>${links.map((l) => `<a href="${esc(l.h)}">${esc(l.t)}</a>`).join('')}</nav>
      <nav class="lp-col" aria-label="Company"><h4>Company</h4><a href="#">About</a><a href="#">Contact</a><a href="#">Press kit</a><a href="#">Careers</a></nav>
      <nav class="lp-col" aria-label="Legal"><h4>Legal</h4><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></nav>
    </div>
    <div class="lp-bottom"><span>${esc(legal)}</span><a class="lp-up" href="#top">Back to top ↑</a></div>`;
  const wrap = foot || Object.assign(document.createElement('footer'), { className: 'foot' });
  wrap.classList.add('lp-foot');
  wrap.innerHTML = html;
  if (!foot) (document.querySelector('main') || document.body).appendChild(wrap);

  const form = wrap.querySelector('.lp-news');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input'), msg = form.querySelector('.lp-msg');
    if (!/^\S+@\S+\.\S+$/.test(input.value)) { msg.textContent = 'That email doesn’t look right.'; msg.dataset.s = 'err'; input.focus(); return; }
    msg.dataset.s = 'ok';
    msg.textContent = '✓ You’re on the list — thank you.';
    input.value = '';
  });
  wrap.querySelector('.lp-up').addEventListener('click', (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: 'smooth' }); });

  // sticky mobile CTA
  if (cta) {
    const bar = document.createElement('a');
    bar.className = 'lp-sticky';
    bar.href = cta.getAttribute('href') || '#';
    bar.textContent = cta.textContent.trim();
    document.body.appendChild(bar);
  }
  const on = () => root.classList.toggle('past-hero', scrollY > innerHeight * 0.7);
  addEventListener('scroll', on, { passive: true });
  on();
}

/* ── small reusable bits ─────────────────────────────────────── */
export function radialTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)', size = 128) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gr.addColorStop(0, inner);
  gr.addColorStop(1, outer);
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ── value-noise (JS side, for terrain etc.) ─────────────────── */
export function createNoise(seed = 7) {
  const r = rng(seed);
  const perm = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  const P = new Uint8Array(512);
  for (let i = 0; i < 512; i++) P[i] = perm[i & 255];
  const vals = Float32Array.from({ length: 256 }, () => r());
  const f = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const h = (x, y) => vals[P[P[x & 255] + (y & 255)]];
  function n2(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = f(xf), v = f(yf);
    return lerp(lerp(h(xi, yi), h(xi + 1, yi), u), lerp(h(xi, yi + 1), h(xi + 1, yi + 1), u), v);
  }
  function fbm(x, y, oct = 5) {
    let a = 0.5, s = 0, n = 0;
    for (let i = 0; i < oct; i++) { s += a * n2(x, y); n += a; x = x * 2.03 + 11.1; y = y * 2.03 + 3.7; a *= 0.5; }
    return s / n;
  }
  return { n2, fbm };
}

/* ── procedural studio reflections (soft-boxes → PMREM) ──────── */
export function createEnv(renderer, panels = [], base = 0x000000) {
  const s = new THREE.Scene();
  s.background = new THREE.Color(base);
  panels.forEach((p) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(p.w ?? 10, p.h ?? 10),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(p.color ?? 0xffffff).multiplyScalar(p.intensity ?? 6), side: THREE.DoubleSide })
    );
    m.position.set(...p.pos);
    m.lookAt(0, 0, 0);
    s.add(m);
  });
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(s, 0.03).texture;
  pm.dispose();
  return tex;
}

/* ── volumetric light shaft (cone, additive, fresnel-faded) ──── */
export function lightShaft({ color = 0x9fe8ff, height = 20, top = 0.2, bottom = 4, intensity = 0.5 } = {}) {
  const g = new THREE.CylinderGeometry(top, bottom, height, 48, 1, true);
  g.translate(0, -height / 2, 0);
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uColor: { value: new THREE.Color(color) }, uI: { value: intensity }, uH: { value: height } },
    vertexShader: `varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){ vY=position.y; vec4 mv=modelViewMatrix*vec4(position,1.); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uI,uH; varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){ float f=abs(dot(normalize(vN),normalize(vV))); float fall=smoothstep(-uH,0.,vY); gl_FragColor=vec4(uColor*uI*pow(f,1.6)*fall,1.); }`,
  });
  return new THREE.Mesh(g, m);
}

/* ── rounded-rect Shape ──────────────────────────────────────── */
export function roundedRectShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
