/* The two non-template shelves: functional app pages and interactive elements.
   Each one is a single self-contained .html file (inline CSS + JS, zero dependencies) in src/demos/.
   They are bundled as raw text, previewed through iframe srcdoc and downloadable as-is. */

export type Kind = "page" | "element";

export type Demo = {
  slug: string;
  kind: Kind;
  name: string;
  tagline: string;
  blurb: string;
  category: string;
  accent: string;
  bg: string;
  light: boolean;
  features: string[];
  tryIt: string[];
};

const PAGE_RAW = import.meta.glob("/src/demos/pages/*.html", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const ELEMENT_RAW = import.meta.glob("/src/demos/elements/*.html", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

export const PAGE_CATEGORIES = ["All", "Authentication", "Commerce", "Product", "Utility"] as const;
export const ELEMENT_CATEGORIES = ["All", "Buttons & cards", "Navigation", "Feedback", "Data & drag", "Motion"] as const;

export const PAGES: Demo[] = [
  {
    slug: "signin", kind: "page", name: "Sign in", category: "Authentication", accent: "#ffb454", bg: "#0d0b14", light: false,
    tagline: "A split-screen login with a living aurora and real validation",
    blurb: "Everything a sign-in page should do and most skip: inline validation as you type, a show/hide password toggle, caps-lock warning, loading and success states, social buttons and a testimonial that rotates on its own. The right half is a canvas aurora that follows your cursor.",
    features: ["Live email + password validation", "Show / hide password, caps-lock detector", "Loading → success state machine", "Canvas aurora that reacts to the pointer", "Auto-rotating testimonials", "Fully keyboard accessible"],
    tryIt: ["Type a bad email, then fix it", "Hold Caps Lock in the password field", "Move your cursor across the right half"],
  },
  {
    slug: "signup", kind: "page", name: "Sign up", category: "Authentication", accent: "#1f6f50", bg: "#f4efe6", light: true,
    tagline: "A three-step account flow with a password strength meter",
    blurb: "Registration broken into three calm steps with a progress rail. A strength meter scores the password live and lists what is missing, the workspace URL is slugified as you type, and the final step celebrates with a summary of what you set up.",
    features: ["3-step flow with animated progress", "Password strength meter + requirement checklist", "Workspace URL auto-slug", "Role picker cards", "Back / continue with validation gates", "Success summary"],
    tryIt: ["Type a password and watch the meter", "Edit the workspace name", "Pick a role, then finish"],
  },
  {
    slug: "reset", kind: "page", name: "Reset password", category: "Authentication", accent: "#5b3df5", bg: "#eeeafb", light: true,
    tagline: "Email → six-digit code → new password, with real OTP inputs",
    blurb: "The recovery flow done properly. OTP boxes auto-advance, accept paste and backspace like a native control, shake on a wrong code and a resend timer counts down. Use code 424242 to continue.",
    features: ["OTP inputs: auto-advance, paste, backspace", "Shake + message on a wrong code", "Resend countdown", "New-password strength check", "Confetti on success", "Three clearly labelled steps"],
    tryIt: ["Enter any email", "Paste 424242 into the code boxes", "Try a wrong code first"],
  },
  {
    slug: "pricing", kind: "page", name: "Pricing", category: "Commerce", accent: "#7b93ff", bg: "#07090f", light: false,
    tagline: "Three plans, a billing toggle and numbers that roll",
    blurb: "A pricing page that does the maths for you: monthly / yearly toggle with rolling digits and a savings badge, a seat slider that reprices the Team plan, a spotlight that follows the cursor across the featured plan, and a feature comparison that opens in place.",
    features: ["Monthly / yearly toggle with rolling numbers", "Seat slider repricing the Team plan", "Cursor-following spotlight on plan cards", "Expandable feature comparison", "FAQ accordion", "Clear primary action per plan"],
    tryIt: ["Flip the billing toggle", "Drag the seats slider", "Open ‘Compare all features’"],
  },
  {
    slug: "checkout", kind: "page", name: "Checkout", category: "Commerce", accent: "#2f6bff", bg: "#f3f5f9", light: true,
    tagline: "A payment form with a live 3D card that flips",
    blurb: "A checkout that builds trust. The card on the left updates as you type, flips to show the CVC when you focus it and detects Visa / Mastercard / Amex. Fields format themselves, the promo code applies a real discount and the order total animates.",
    features: ["Live card preview with 3D flip", "Card brand detection + auto-formatting", "Expiry + CVC validation", "Promo code (try LAUNCH20)", "Animated order total", "Processing → confirmation state"],
    tryIt: ["Type 4242 4242 4242 4242", "Focus the CVC field", "Apply code LAUNCH20"],
  },
  {
    slug: "dashboard", kind: "page", name: "Dashboard", category: "Product", accent: "#3dffb5", bg: "#0a0e13", light: false,
    tagline: "KPIs, an interactive chart and a sortable table",
    blurb: "An analytics dashboard with real behaviour: range tabs redraw the area chart with a smooth morph, hovering scrubs a tooltip along the line, KPI cards carry sparklines and animated counters, and the customers table sorts and filters instantly.",
    features: ["Area chart with scrubbing tooltip", "7 / 30 / 90-day range tabs", "KPI cards with sparklines + counters", "Sortable, searchable table", "Live activity feed", "Collapsible sidebar"],
    tryIt: ["Hover across the chart", "Switch the range", "Click a table header to sort"],
  },
  {
    slug: "settings", kind: "page", name: "Settings", category: "Product", accent: "#ff5a36", bg: "#f7f5f2", light: true,
    tagline: "Profile, notifications and security with a live theme switch",
    blurb: "A settings page with tabs that remember where you were, an avatar uploader with instant preview, toggles that save as you flip them, a theme switcher that restyles the page live and a danger zone that makes you type to confirm.",
    features: ["Animated tab indicator", "Avatar upload with instant preview", "Auto-saving toggles + toast", "Live accent-colour theme switcher", "Two-factor setup card", "Type-to-confirm danger zone"],
    tryIt: ["Pick a different accent colour", "Flip a notification toggle", "Upload a photo"],
  },
  {
    slug: "onboarding", kind: "page", name: "Onboarding", category: "Product", accent: "#ff6ad5", bg: "#0b0a12", light: false,
    tagline: "A guided welcome flow that ends in a checklist",
    blurb: "A first-run experience people actually finish. Choose what you are here for, name your workspace, invite teammates with email chips, then land on an animated setup checklist with a progress ring.",
    features: ["Interest cards with multi-select", "Workspace naming with live preview", "Email chip input (Enter / comma)", "Animated progress ring checklist", "Step dots you can click back to", "Skip-for-now escape hatch"],
    tryIt: ["Select two or three interests", "Add teammates with Enter", "Tick the checklist items"],
  },
  {
    slug: "notfound", kind: "page", name: "404 page", category: "Utility", accent: "#5cffc4", bg: "#1b2cff", light: false,
    tagline: "The only 404 that follows you with its eyes",
    blurb: "An error page that turns a dead end into a moment. The zero is an eyeball that tracks your cursor and blinks, there is a working search that suggests real destinations, and a ‘take me home’ button that is impossible to miss.",
    features: ["Cursor-tracking eye with blinking", "Search with live suggestions", "Keyboard-friendly results", "Big, obvious way home", "Parallax floating shapes", "Click the eye. Go on."],
    tryIt: ["Move your cursor around", "Click the eye", "Type ‘pri’ into the search"],
  },
];

export const ELEMENTS: Demo[] = [
  {
    slug: "magnetic", kind: "element", name: "Magnetic buttons", category: "Buttons & cards", accent: "#5cffc4", bg: "#0b0c10", light: false,
    tagline: "Buttons that lean toward your cursor",
    blurb: "Six button styles that feel alive: magnetic pull with spring return, ripples from the exact click point, a sheen that sweeps on hover and a hold-to-confirm button that fills as you press.",
    features: ["Magnetic pull with spring physics", "Click ripples from the pointer", "Hold-to-confirm progress fill", "Shine sweep + arrow slide", "Respects reduced motion"],
    tryIt: ["Hover near a button without touching it", "Hold ‘Hold to delete’", "Click anywhere on a button"],
  },
  {
    slug: "spotlight", kind: "element", name: "Spotlight cards", category: "Buttons & cards", accent: "#8ab4ff", bg: "#07090e", light: false,
    tagline: "A bento grid lit by your cursor",
    blurb: "A bento grid where one soft light follows the pointer across every card at once, revealing borders and inner glow. Cards tilt toward the cursor and a sixth card holds a live mini-chart.",
    features: ["Single light shared across all cards", "Border reveal + inner glow", "Pointer-based tilt", "Live mini sparkline", "Pure CSS variables + 40 lines of JS"],
    tryIt: ["Sweep the cursor across the grid", "Hover the chart card"],
  },
  {
    slug: "holo", kind: "element", name: "Holographic card", category: "Buttons & cards", accent: "#c78bff", bg: "#0c0a16", light: false,
    tagline: "A membership card with foil, glare and depth",
    blurb: "A collectible-style card that tilts in 3D toward the pointer, with a rainbow foil that shifts, a glare that slides across the surface and layered parallax on the logo, chip and name. Works with touch drag.",
    features: ["3D tilt with eased return", "Foil gradient driven by pointer", "Glare highlight", "Layered parallax depth", "Touch + mouse support"],
    tryIt: ["Move slowly over the card", "Leave and watch it settle", "Drag with a finger on mobile"],
  },
  {
    slug: "command", kind: "element", name: "Command menu", category: "Navigation", accent: "#7cf5ff", bg: "#0a0d12", light: false,
    tagline: "⌘K for any product, with fuzzy search",
    blurb: "A command palette with grouped results, fuzzy matching with highlighted letters, full keyboard navigation, recent actions and a footer of key hints. Choosing an action fires a toast.",
    features: ["Fuzzy search with highlighted letters", "Arrow / Enter / Esc navigation", "Grouped sections + shortcuts", "Opens with ⌘K / Ctrl K", "Action feedback toast"],
    tryIt: ["Press ⌘K or Ctrl K", "Type ‘tgl’ for ‘Toggle theme’", "Use ↑ ↓ and Enter"],
  },
  {
    slug: "dock", kind: "element", name: "Magnifying dock", category: "Navigation", accent: "#ffcf6b", bg: "#141018", light: false,
    tagline: "A dock whose icons swell as you approach",
    blurb: "A macOS-style dock with smooth magnification that falls off with distance, tooltips that follow the icon, a bounce when you click and running-app indicators. Built with one distance function.",
    features: ["Distance-based magnification", "Floating labels", "Click bounce animation", "Running indicators", "Touch-friendly fallback"],
    tryIt: ["Slide across the dock", "Click an icon", "Move away quickly"],
  },
  {
    slug: "toasts", kind: "element", name: "Toast notifications", category: "Feedback", accent: "#ff7a59", bg: "#f5f3ef", light: true,
    tagline: "A notification system with undo, progress and swipe",
    blurb: "Stacked toasts that slide, collapse and expand on hover, with a timer bar that pauses while you read, swipe-to-dismiss, an Undo action and a promise toast that morphs from loading to success.",
    features: ["Stack that fans out on hover", "Pause on hover with progress bar", "Swipe or click to dismiss", "Undo action", "Promise toast: loading → success"],
    tryIt: ["Fire several toasts, then hover the stack", "Press ‘Promise’", "Drag a toast sideways"],
  },
  {
    slug: "compare", kind: "element", name: "Before / after slider", category: "Data & drag", accent: "#4dd6a8", bg: "#0a0f0e", light: false,
    tagline: "A comparison slider with drag, keys and an auto-demo",
    blurb: "A before / after reveal that works with mouse, touch and keyboard. It plays a short auto-demo to teach the gesture, snaps with a gentle ease on click and exposes proper slider semantics.",
    features: ["Pointer + touch + keyboard control", "Auto-demo teaches the gesture", "Click-to-jump with easing", "ARIA slider semantics", "Works with any two layers"],
    tryIt: ["Drag the handle", "Focus it and press ← →", "Click anywhere on the image"],
  },
  {
    slug: "kanban", kind: "element", name: "Kanban board", category: "Data & drag", accent: "#ff9bd0", bg: "#0e0b12", light: false,
    tagline: "Drag cards between columns with a smooth drop",
    blurb: "A drag-and-drop board using pointer events: the card lifts and tilts while you hold it, a placeholder shows exactly where it will land, columns count their cards and a quick-add input creates new tasks.",
    features: ["Pointer-event drag with lift + tilt", "Live drop placeholder", "Column counts + WIP", "Quick-add per column", "Touch support"],
    tryIt: ["Drag a card to another column", "Add a card with Enter", "Drop between two cards"],
  },
  {
    slug: "typography", kind: "element", name: "Type playground", category: "Motion", accent: "#ff5a36", bg: "#f2efe9", light: true,
    tagline: "Scramble, split, stretch — typography that performs",
    blurb: "Four kinetic type effects in one stage: a decode scramble on hover, a variable-weight headline that responds to the cursor, a velocity marquee that speeds up when you scroll and a split-letter wave.",
    features: ["Scramble-decode on hover", "Cursor-driven font weight", "Velocity-reactive marquee", "Letter wave with stagger", "Copy any headline"],
    tryIt: ["Hover the scrambling word", "Move across the big headline", "Scroll inside the stage"],
  },
  {
    slug: "particles", kind: "element", name: "Particle playground", category: "Motion", accent: "#6ee7ff", bg: "#05060a", light: false,
    tagline: "Ten thousand points that chase, scatter and swirl",
    blurb: "A canvas particle system with four modes — attract, repel, swirl and ring — running at 60fps on thousands of points. Click to burst, switch colour palettes and watch the counter.",
    features: ["Attract / repel / swirl / ring modes", "Click to burst", "Three colour palettes", "DPR-aware canvas", "Pauses when off-screen"],
    tryIt: ["Switch modes", "Click to burst", "Hold the mouse still"],
  },
];

const RAW: Record<Kind, Record<string, string>> = { page: PAGE_RAW, element: ELEMENT_RAW };

export const listFor = (kind: Kind) => (kind === "page" ? PAGES : ELEMENTS);
export const demoBySlug = (kind: Kind, slug: string) => listFor(kind).find((d) => d.slug === slug);

export function demoSource(kind: Kind, slug: string): string {
  const dir = kind === "page" ? "pages" : "elements";
  const v = RAW[kind][`/src/demos/${dir}/${slug}.html`];
  if (v === undefined) return `<!doctype html><body style="font:16px system-ui;padding:40px">Missing demo: ${slug}</body>`;
  return v;
}

export function downloadDemo(d: Demo) {
  const blob = new Blob([demoSource(d.kind, d.slug)], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${d.slug}-${d.kind}.html`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function openDemoFullscreen(d: Demo) {
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.open();
  w.document.write(demoSource(d.kind, d.slug));
  w.document.close();
}
