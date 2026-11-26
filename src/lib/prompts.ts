export type Prompt = { id: string; category: string; title: string; summary: string; body: string };

/** General prompts that work on ANY template. `{name}` is replaced with the template name. */
export const PROMPTS: Prompt[] = [
  {
    id: "rebrand",
    category: "Content",
    title: "Rebrand + rewrite copy",
    summary: "Swap name, copy and CTAs in one pass.",
    body: `Open index.html in this project ({name}). Replace the brand name everywhere (nav, loader, footer, <title>) with "[YOUR BRAND]". Rewrite all headlines, paragraphs, stats and button labels for this business: [one-sentence description + audience + tone]. Keep the same number of sections, the same data-split / data-reveal attributes and the same class names. Do not touch main.js.`,
  },
  {
    id: "palette",
    category: "Style",
    title: "Change the colour palette",
    summary: "Re-theme the whole scene and UI together.",
    body: `Re-theme this project ({name}) to this palette: background [#hex], accent [#hex], text [#hex]. Update the CSS variables in style.css, then update the matching colours in main.js (CONFIG object, lights, fog, background, emissive materials) so the 3D scene and the HTML feel like one design. Keep bloom subtle and make sure text contrast stays AA.`,
  },
  {
    id: "fonts",
    category: "Style",
    title: "Swap the typography",
    summary: "New display + body fonts, same rhythm.",
    body: `Replace the fonts in {name}: display font "[FONT A]" and body font "[FONT B]" from Google Fonts. Update the <link> in index.html and the --font-display / --font-body variables in style.css. Adjust letter-spacing and line-height on .h-xl, .h-lg and .lead so headlines still look tight and intentional.`,
  },
  {
    id: "glb",
    category: "3D",
    title: "Drop in my own 3D model",
    summary: "Replace the hero object with a .glb.",
    body: `In {name}, replace the main hero object with my model at models/hero.glb. This project has no bundler, so: copy GLTFLoader.js (and DRACOLoader if needed) from three/examples/jsm/loaders into vendor/addons/loaders/ and import it as 'three/addons/loaders/GLTFLoader.js'. Auto-centre and scale the model to fit the same bounding size as the old object, keep the existing animation/scroll behaviour, and show the loader until the model is ready.`,
  },
  {
    id: "sections",
    category: "Content",
    title: "Add a new scroll section",
    summary: "Extend the story without breaking the camera.",
    body: `Add a new section between sections 3 and 4 of {name}: [describe content]. Add the markup to index.html (class "sec", data-sec attribute, a dot in the .dots nav). In main.js the camera rail uses one keyframe per section, so add one more position + target keyframe for the new section, and update any scroll-range maths (like the p * 4 interpolation) to use the new section count.`,
  },
  {
    id: "next",
    category: "Port",
    title: "Port to Next.js (App Router)",
    summary: "Run it as a client component in an existing app.",
    body: `Port the {name} template to my Next.js App Router project. Install three. Move shared/core.js into lib/three/core.ts (type it), main.js into a 'use client' component that creates the scene inside useEffect and fully disposes renderer, geometries, materials, textures and listeners on unmount. Move style.css + shared/base.css into CSS modules or globals. Replace the importmap with normal imports ('three', 'three/examples/jsm/...'). Keep the DOM overlay markup as JSX. Make it SSR-safe (no window access outside effects).`,
  },
  {
    id: "react",
    category: "Port",
    title: "Port to React + Vite",
    summary: "Same scene, component-based.",
    body: `Convert the {name} template into a Vite + React + TypeScript app. Keep the vanilla Three.js code (no react-three-fiber) but wrap it in a <Scene /> component that mounts in useEffect and cleans up on unmount. Convert index.html sections into React components, keep the same CSS, and replace the importmap with npm imports of three.`,
  },
  {
    id: "mobile",
    category: "Performance",
    title: "Make it fast on phones",
    summary: "Adaptive quality without losing the look.",
    body: `Optimise {name} for mobile and weak GPUs. Cap pixel ratio at 1.5 on phones, lower bloom resolution, reduce particle/instance counts when innerWidth < 800 or hardwareConcurrency <= 4, and disable MSAA on those devices. Add a prefers-reduced-motion path that freezes camera motion and shows a static frame. Target a steady 60fps on a mid-range phone.`,
  },
  {
    id: "audio",
    category: "3D",
    title: "Add ambient sound + hover sfx",
    summary: "Optional audio with a mute toggle.",
    body: `Add optional audio to {name}: a looping ambient track (audio/ambient.mp3) that fades in after the first user click, a subtle whoosh tied to scroll velocity, and a small tick on button hover. Add a mute toggle in the nav that remembers its state in localStorage. Never autoplay before a user gesture.`,
  },
  {
    id: "form",
    category: "Content",
    title: "Wire the CTA to a real form",
    summary: "Waitlist / contact form with validation.",
    body: `Replace the final CTA buttons of {name} with an email capture form (label, input, submit). Validate client-side, POST JSON to /api/subscribe (stub the endpoint with a TODO), show a success state that reuses the data-reveal animation, and keep the layout and typography intact.`,
  },
  {
    id: "a11y",
    category: "Performance",
    title: "Accessibility + fallbacks",
    summary: "Reduced motion, keyboard, no-WebGL.",
    body: `Make {name} accessible: add skip-to-content, visible focus rings, aria-labels for icon buttons, ensure all text is real HTML, respect prefers-reduced-motion by slowing/stopping camera movement, and provide a good no-WebGL fallback (static gradient hero + readable content) triggered when WebGL init fails.`,
  },
  {
    id: "deploy",
    category: "Port",
    title: "Deploy to Vercel / Netlify",
    summary: "It's static — it should take two minutes.",
    body: `Prepare {name} for static deployment: add a vercel.json / netlify.toml with caching headers (immutable for vendor/ and shared/), add meta tags + Open Graph image placeholders to index.html, a favicon, and a short deploy guide in README.md. No build step is needed because the project is static.`,
  },
];

export const fill = (p: string, name: string) => p.replaceAll("{name}", name);
