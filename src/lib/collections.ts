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
    slug: "booking", kind: "page", name: "Booking", category: "Product", accent: "#b9a4ff", bg: "#0b0b10", light: false,
    tagline: "A scheduling flow with a live calendar and real .ics export",
    blurb: "Pick a day, pick a time, confirm — the way a booking page should feel. The calendar only opens real weekdays, time slots re-render for the duration you choose, 12h / 24h switches instantly and the confirmation downloads a genuine calendar file.",
    features: ["Month calendar with availability", "15 / 30 / 60 minute durations with sliding thumb", "12h / 24h time slots, busy times struck through", "Validated confirm form", "Downloads a real .ics invite", "Fully keyboard accessible"],
    tryIt: ["Switch the duration", "Pick a day, then a time", "Confirm and add it to your calendar"],
  },
  {
    slug: "inbox", kind: "page", name: "Inbox", category: "Product", accent: "#0b8ea8", bg: "#eceef2", light: true,
    tagline: "A three-pane mail client driven by the keyboard",
    blurb: "A calm mail client with folders, search, a reading pane and a reply box. Move with J / K, archive with E, star with S — archived mail slides away and Undo brings it back. Built from one array of messages so you can wire it to anything.",
    features: ["Folders, counts and live search", "J / K navigation, E archive, S star, U unread", "Animated archive with Undo toast", "Reading pane with reply composer", "Responsive down to one column", "~200 lines, zero dependencies"],
    tryIt: ["Press J then E", "Type ‘invoice’ in search", "Archive something, then hit Undo"],
  },
  {
    slug: "invoice", kind: "page", name: "Invoice builder", category: "Commerce", accent: "#ff7a59", bg: "#0d0f12", light: false,
    tagline: "Edit on the left, watch the paper update on the right",
    blurb: "An invoice maker that does the arithmetic and the typography. Line items, tax and discount sliders and three currencies feed a paper preview with rolling totals; mark it paid and a stamp lands. Print styles turn the preview into a clean PDF.",
    features: ["Live paper preview", "Add / remove line items", "Tax + discount sliders, 3 currencies", "Rolling total animation", "Paid stamp", "Print-to-PDF stylesheet"],
    tryIt: ["Drag the tax slider", "Add a line item", "Press ‘Mark as paid’"],
  },
  {
    slug: "status", kind: "page", name: "Status page", category: "Utility", accent: "#16a36a", bg: "#f7f7f3", light: true,
    tagline: "A 90-day uptime board with live telemetry",
    blurb: "A public status page people actually trust. Five services show 90 days of uptime bars with hover tooltips, a live latency sparkline updates every few seconds and the banner flips to a warning if a spike hits. Past incidents read like a log.",
    features: ["90-day bars with tooltips", "Live latency sparkline (canvas)", "Banner reacts to degraded state", "Incident timeline", "Subscribe field with validation", "Light, editorial design"],
    tryIt: ["Hover along the bars", "Wait for the latency to spike", "Subscribe with a bad email"],
  },
  {
    slug: "notfound", kind: "page", name: "404 · Lost in the dark", category: "Utility", accent: "#ffd9a0", bg: "#05060a", light: false,
    tagline: "A dead end lit by a single beam you control",
    blurb: "An error page that turns a dead end into a moment. The page sits in darkness; your cursor is the only light, drawing fireflies toward it. Click to widen the beam. A working search with suggestions and an obvious way home keep it useful.",
    features: ["Cursor-driven light with eased follow", "70 fireflies attracted to the beam", "Search with keyboard suggestions", "Auto-wanders on touch / idle", "Obvious primary action", "Respects touch devices"],
    tryIt: ["Move the light over the headline", "Click and hold to widen it", "Type ‘pri’ into the search"],
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
    slug: "toasts", kind: "element", name: "Toast notifications", category: "Feedback", accent: "#ff7a59", bg: "#f5f3ef", light: true,
    tagline: "A notification system with undo, progress and swipe",
    blurb: "Stacked toasts that slide, collapse and expand on hover, with a timer bar that pauses while you read, swipe-to-dismiss, an Undo action and a promise toast that morphs from loading to success.",
    features: ["Stack that fans out on hover", "Pause on hover with progress bar", "Swipe or click to dismiss", "Undo action", "Promise toast: loading → success"],
    tryIt: ["Fire several toasts, then hover the stack", "Press ‘Promise’", "Drag a toast sideways"],
  },
  {
    slug: "kanban", kind: "element", name: "Kanban board", category: "Data & drag", accent: "#ff9bd0", bg: "#0e0b12", light: false,
    tagline: "Drag cards between columns with a smooth drop",
    blurb: "A drag-and-drop board using pointer events: the card lifts and tilts while you hold it, a placeholder shows exactly where it will land, columns count their cards and a quick-add input creates new tasks.",
    features: ["Pointer-event drag with lift + tilt", "Live drop placeholder", "Column counts + WIP", "Quick-add per column", "Touch support"],
    tryIt: ["Drag a card to another column", "Add a card with Enter", "Drop between two cards"],
  },
  {
    slug: "controls", kind: "element", name: "Controls", category: "Buttons & cards", accent: "#6ee7ff", bg: "#090b10", light: false,
    tagline: "Switches, sliders, steppers and chips with real weight",
    blurb: "Eight form controls designed as a family. Switches stretch under your thumb, the segmented thumb springs between options, the range slider eases toward your pointer with a floating tooltip, and the stepper rolls its digits and repeats while held.",
    features: ["Spring-physics switch + segmented thumb", "Eased range slider with tooltip + keyboard", "Rolling-digit stepper with hold-to-repeat", "Star rating with hover preview", "Drawn-on checkmarks, radio cards, chips", "All ARIA roles wired up"],
    tryIt: ["Drag a slider and let go fast", "Hold the + button", "Hover across the stars"],
  },
  {
    slug: "cardstack", kind: "element", name: "Card stack", category: "Data & drag", accent: "#c78bff", bg: "#0e0a17", light: false,
    tagline: "A swipeable deck with physics, undo and stamps",
    blurb: "A Tinder-style stack done with care: cards tilt as you drag, SAVE / PASS stamps fade in, the deck behind rises to fill the gap and a fling carries momentum. Buttons, arrow keys and an undo that rewinds the last card all work.",
    features: ["Pointer drag with rotation + stamps", "Deck depth and brightness layering", "Fling-out animation + undo", "Keyboard ← → and Z", "Summary when the deck ends", "No libraries"],
    tryIt: ["Drag a card past the edge", "Press → on the keyboard", "Undo the last pass"],
  },
  {
    slug: "radial", kind: "element", name: "Radial menu", category: "Navigation", accent: "#ffc27a", bg: "#100c09", light: false,
    tagline: "Press anywhere, flick toward an action",
    blurb: "A pie menu that blooms under your pointer. Items spring out in sequence, the nearest wedge lights up and scales, the centre names it, and releasing applies it. Because direction equals action, it becomes muscle memory.",
    features: ["Opens at the pointer, clamped to the viewport", "Angle-based selection with wedge highlight", "Staggered spring entrance", "Hold-and-flick or click-then-click", "Escape to cancel", "Six actions, easy to swap"],
    tryIt: ["Press and hold anywhere", "Flick up then release", "Tap, then tap an action"],
  },
];

export const listFor = (kind: Kind) => (kind === "page" ? PAGES : ELEMENTS);
export const demoBySlug = (kind: Kind, slug: string) => listFor(kind).find((d) => d.slug === slug);

/** Served by app/kit/[kind]/[slug]/route.ts straight from kit-src/. `?embed=card` injects the scrub bridge. */
export const kitUrl = (d: Pick<Demo, "kind" | "slug">, query = "") => `/kit/${d.kind}/${d.slug}${query ? "?" + query : ""}`;

export function downloadDemo(d: Demo) {
  const a = document.createElement("a");
  a.href = kitUrl(d, "download=1");
  a.download = `${d.slug}-${d.kind}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function openDemoFullscreen(d: Demo) {
  window.open(kitUrl(d), "_blank");
}
