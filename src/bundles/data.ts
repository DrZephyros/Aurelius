/* Bundles — a landing page and every page around it, in ONE theme.
   Each bundle = a scroll-driven WebGL world (src/bundles/scenes/<slug>.ts) + four functional pages
   (pricing, sign-in, reserve/order, account) that share its palette, type and camera. */

export type PageKey = "pricing" | "signin" | "reserve" | "account";

export type Plan = { id: string; name: string; price: [number, number]; blurb: string; features: string[]; hot?: boolean };
export type Chapter = { kicker: string; title: string; body: string; stat?: [string, string]; side?: "left" | "right" | "center" };

export type Bundle = {
  slug: string;
  name: string;
  wordmark: string;
  tagline: string;
  blurb: string;
  category: string;
  gpu: "Medium" | "Heavy";
  theme: { accent: string; accent2: string; bg: string; fg: string; muted: string; card: string; display: string; radius: number };
  hero: { kicker: string; sub: string; cta: string; hint: string };
  chapters: Chapter[];
  nav: Record<PageKey, string>;
  pose: Record<PageKey, number>;
  techniques: string[];
  pricing: { eyebrow: string; title: string; lead: string; toggle: [string, string]; unit: [string, string]; note: string; plans: Plan[]; faq: [string, string][] };
  signin: { title: string; lead: string; cta: string; quote: [string, string] };
  reserve: {
    title: string; lead: string; dateLabel: string; qtyLabel?: string; qtyMax?: number; partyLabel?: string; partyMax?: number;
    mult: "qty" | "party" | "none"; extraMult: "qty" | "party" | "none"; unit: string; confirm: string;
    extras: { id: string; label: string; price: number }[];
  };
  account: { title: string; stats: [string, string, string][]; chartLabel: string; chart: number[]; listLabel: string; items: [string, string, string][] };
};

const SERIF = `ui-serif, "Iowan Old Style", "Palatino Linotype", Georgia, serif`;
const GROT = `"Space Grotesk Variable", "Inter Variable", ui-sans-serif, sans-serif`;

export const BUNDLES: Bundle[] = [
  {
    slug: "yoru",
    name: "Yoru",
    wordmark: "YORU",
    tagline: "A mountain-shrine retreat. A hundred and twelve steps into the night.",
    blurb: "Climb a lantern-lit stair through five torii gates under a blood moon, and arrive at a temple hall that sleeps seven. A hospitality bundle: the immersive landing page plus stays, member gate, reservation flow and guest account — all in lacquer red and ink.",
    category: "Hospitality · Retreat",
    gpu: "Heavy",
    theme: { accent: "#ff5a48", accent2: "#ffb27a", bg: "#09050c", fg: "#f6ebe4", muted: "#a28f97", card: "#140a14", display: SERIF, radius: 6 },
    hero: { kicker: "Mount Hakusan · Kyōto Prefecture", sub: "A night-time retreat above the cloud line. Climb the stair, pass five gates, leave the city at the bottom.", cta: "Begin the ascent", hint: "Scroll to climb" },
    chapters: [
      { kicker: "01 — The first gate", title: "Leave the noise at the bottom.", body: "The road ends at a gate the colour of a cut. Beyond it there is only the stair, the pines, and the sound of your own breathing.", side: "left" },
      { kicker: "02 — Lanterns", title: "Lit by hand, every dusk.", body: "Forty-two stone lanterns line the climb. The keeper lights each one with a single taper, starting at the top so the way down is never dark.", stat: ["42", "lanterns, lit by hand"], side: "right" },
      { kicker: "03 — The fifth gate", title: "Five gates. One hundred and twelve steps. One moon.", body: "Somewhere past the third gate the phone goes quiet. By the fifth, you stop counting.", stat: ["112", "steps to the hall"], side: "left" },
      { kicker: "04 — The hall", title: "Seven rooms. One kitchen. No signal.", body: "Cedar floors, paper walls, a private cypress bath under the stars. Dinner is kaiseki, served when the last light leaves the ridge.", stat: ["7", "rooms only"], side: "right" },
      { kicker: "05 — Arrive", title: "The gate is open until dawn.", body: "Reserve a room, become a member of the temple book, and the keeper will leave a lantern burning for you.", side: "center" },
    ],
    nav: { pricing: "Stays", signin: "Member gate", reserve: "Reserve", account: "My stay" },
    pose: { pricing: 0.2, signin: 0.02, reserve: 0.34, account: 0.9 },
    techniques: ["112 instanced stone steps", "Five torii on a spline rail", "Shader moon with craters + halo", "Wrapping petal & ember fields", "Camera-borne lantern light", "Speed-linked FOV and horizon banking"],
    pricing: {
      eyebrow: "Stays", title: "Choose how you sleep.", lead: "Every room includes breakfast, the evening tea ceremony and the keeper’s map of the night walk.",
      toggle: ["Single night", "Seven nights"], unit: ["per night", "per night, 7+"], note: "Stay a week and the nightly rate drops by ~18%.",
      plans: [
        { id: "pilgrim", name: "Pilgrim", price: [240, 198], blurb: "A tatami cell for one. Simple, quiet, close to the bell.", features: ["Single tatami room", "Shared cypress bath", "Breakfast & tea ceremony", "Night-walk map"] },
        { id: "garden", name: "Garden Room", price: [360, 295], blurb: "Paper doors open onto the moss garden. Sleeps two.", hot: true, features: ["Garden-facing room for two", "Private bath, open air", "Breakfast & kaiseki dinner", "Lantern night walk", "Late checkout"] },
        { id: "hall", name: "Hall Suite", price: [590, 480], blurb: "The upper hall under the second roof. Sleeps four.", features: ["Whole upper hall", "Private cypress onsen", "All meals, sake pairing", "Dedicated keeper", "Moon-viewing platform"] },
      ],
      faq: [["How hard is the climb?", "112 shallow steps — about ten minutes. We carry luggage up for you."], ["Is there phone signal?", "No, and that is the point. The hall has one landline for emergencies."], ["Can I cancel?", "Free up to seven days before arrival; after that we keep one night."]],
    },
    signin: { title: "Enter the gate.", lead: "Sign in to the temple book to manage reservations and see your lantern points.", cta: "Open the gate", quote: ["I climbed at dusk and did not check my phone until I came down. I have not slept better in ten years.", "Mika T. — guest since 2023"] },
    reserve: {
      title: "Reserve a room.", lead: "Three short steps. The keeper confirms by hand within a day.", dateLabel: "Arrival", qtyLabel: "Nights", qtyMax: 14, partyLabel: "Guests", partyMax: 4,
      mult: "qty", extraMult: "none", unit: "night", confirm: "Your lantern is reserved.",
      extras: [{ id: "tea", label: "Tea ceremony", price: 45 }, { id: "walk", label: "Lantern night walk", price: 30 }, { id: "kaiseki", label: "Kaiseki dinner", price: 85 }, { id: "onsen", label: "Private onsen hour", price: 60 }],
    },
    account: {
      title: "Your stay", stats: [["Nights booked", "9", "+3 this year"], ["Next arrival", "Oct 14", "in 21 days"], ["Lantern points", "1,280", "+240"]],
      chartLabel: "Moon calendar — nights per month", chart: [1, 0, 2, 0, 0, 3, 2, 0, 1, 4, 0, 0],
      listLabel: "Past stays", items: [["Garden Room · 3 nights", "Mar 2025", "Completed"], ["Pilgrim · 1 night", "Nov 2024", "Completed"], ["Hall Suite · 5 nights", "Jun 2024", "Completed"]],
    },
  },
  {
    slug: "helm",
    name: "Helm",
    wordmark: "HELM·01",
    tagline: "A navigation instrument for people who still want to feel the sea.",
    blurb: "A hardware launch in WebGL: a bronze-bezel compass built big enough to fly through, 360 ticks that light as the heading turns, and a readout that follows your scroll. Includes the order flow, account and fleet dashboard in the same brass and deep-water palette.",
    category: "Product · Hardware launch",
    gpu: "Heavy",
    theme: { accent: "#ffa94d", accent2: "#3de7ff", bg: "#040b12", fg: "#eef4f7", muted: "#7f93a4", card: "#08141d", display: GROT, radius: 14 },
    hero: { kicker: "Instrument 01 — calibrated at 67°", sub: "One dial. 360 ticks. A bearing you can read in direct sun and trust in a storm.", cta: "Calibrate", hint: "Scroll to turn the dial" },
    chapters: [
      { kicker: "01 — The bezel", title: "Milled from a single billet of marine bronze.", body: "Eleven hours on the mill, then hand-finished until the light rolls across it like water.", side: "left" },
      { kicker: "02 — The card", title: "Every tick lights as you pass it.", body: "The card turns beneath a fixed lubber line. Behind your heading, the scale glows and fades — you read direction at a glance, in peripheral vision.", stat: ["360", "individually lit ticks"], side: "right" },
      { kicker: "03 — The sweep", title: "A bearing, readable in direct sun.", body: "The outer sweep arc runs at 1,200 nits and drops to a candle at night. Red-shift mode keeps your night vision intact.", stat: ["1,200", "nits peak brightness"], side: "left" },
      { kicker: "04 — Calibration", title: "±0.1° and no drift.", body: "A solid-state magnetometer, auto-calibrated every sixty seconds against the horizon and your wake.", stat: ["±0.1°", "accuracy · IP68 · 3-year battery"], side: "right" },
      { kicker: "05 — Order", title: "Find your heading.", body: "Ships in a foam-cut walnut case. Engraving is free, for as long as you can spell it.", side: "center" },
    ],
    nav: { pricing: "Models", signin: "Captain’s log", reserve: "Order", account: "Fleet" },
    pose: { pricing: 0.3, signin: 0.04, reserve: 0.56, account: 0.93 },
    techniques: ["Canvas-texture dial card, live readout", "360 instanced ticks recoloured per heading", "PMREM room environment on bronze + glass", "Additive sweep-arc shader", "Orbit → macro → dive → reveal rail", "Heading derived from scroll in one pure function"],
    pricing: {
      eyebrow: "Models", title: "Three ways to find north.", lead: "Same dial, same accuracy. Choose the housing, the battery and how many you need on the water.",
      toggle: ["Buy outright", "12-month plan"], unit: ["one-time", "per month × 12"], note: "The plan includes the Fleet app and free replacement for 3 years.",
      plans: [
        { id: "coastal", name: "Coastal", price: [490, 42], blurb: "Day-boat and dinghy. The essential dial.", features: ["Bronze-finish aluminium", "±0.5° accuracy", "30-day battery", "Handheld mount"] },
        { id: "offshore", name: "Offshore", price: [890, 76], blurb: "Bronze bezel, sapphire glass, red-shift night mode.", hot: true, features: ["Milled marine bronze", "±0.1° accuracy", "Sapphire glass", "Red-shift night mode", "Fleet app included"] },
        { id: "meridian", name: "Meridian Pro", price: [1490, 128], blurb: "Gimballed, NMEA-linked, built for crossing oceans.", features: ["Gimbal + NMEA 2000", "Triple redundant sensors", "3-year battery", "Autopilot handoff", "Lifetime recalibration"] },
      ],
      faq: [["Does it need GPS?", "No. Heading comes from the magnetometer and gyro; GPS is optional for the Fleet app."], ["Is it waterproof?", "IP68, tested to 3 m for 30 minutes. It floats."], ["Can I return it?", "30 days, no questions, free return label."]],
    },
    signin: { title: "Open the captain’s log.", lead: "Sign in to see your instruments, registered vessels and calibration history.", cta: "Sign in", quote: ["It reads like an old brass gauge and behaves like a surgical instrument. I stopped looking at the chartplotter.", "Ines R. — skipper, Cat 34"] },
    reserve: {
      title: "Configure & order.", lead: "Pick a model, choose your extras and a delivery window. Nothing is charged today.", dateLabel: "Earliest delivery", qtyLabel: "Units", qtyMax: 10,
      mult: "qty", extraMult: "qty", unit: "unit", confirm: "Your instrument is on the bench.",
      extras: [{ id: "engrave", label: "Engraving", price: 0 }, { id: "gimbal", label: "Gimbal mount", price: 120 }, { id: "case", label: "Walnut hard case", price: 90 }, { id: "fleet", label: "Fleet sync (1 yr)", price: 60 }],
    },
    account: {
      title: "Fleet", stats: [["Instruments", "3", "all online"], ["Last calibration", "12 min", "auto"], ["Nautical miles", "1,942", "+212 this month"]],
      chartLabel: "Logged miles — last 12 weeks", chart: [38, 52, 40, 61, 75, 58, 90, 84, 66, 102, 96, 118],
      listLabel: "Registered vessels", items: [["Meltemi · Cat 34", "Offshore · 67°", "Online"], ["Tender II", "Coastal · 142°", "Online"], ["Albatross", "Meridian Pro · 301°", "Idle"]],
    },
  },
  {
    slug: "altai",
    name: "Altai",
    wordmark: "ALTAI",
    tagline: "Guided expeditions to the roof of the range.",
    blurb: "Fly a valley at first light, pass three glowing base camps and climb the last ridge until the clouds are below you. An adventure-travel bundle: cinematic landing, trip tiers, climber sign-in, booking flow and an expedition dashboard in dawn rose and glacier blue.",
    category: "Travel · Expeditions",
    gpu: "Heavy",
    theme: { accent: "#ff9d66", accent2: "#8fd0ff", bg: "#0b0d1c", fg: "#fbf1ee", muted: "#a99aa8", card: "#141730", display: GROT, radius: 22 },
    hero: { kicker: "Altai Range · 4,506 m", sub: "Eleven guides. Three camps. One summit, and a sunrise you will not describe correctly.", cta: "Start the climb", hint: "Scroll to fly the valley" },
    chapters: [
      { kicker: "01 — The valley", title: "The trail starts where the road gives up.", body: "A day of walking through larch and glacier-melt rivers. The pack is lighter than you think; the silence is heavier.", side: "left" },
      { kicker: "02 — Base camp", title: "Every camp has a fire, and a name.", body: "Three camps, each higher and colder than the last. Hot food at every one, a guide in every tent, and the stars very close.", stat: ["3", "staffed base camps"], side: "right" },
      { kicker: "03 — The ridge", title: "Where the valley floor falls away.", body: "Crampons on at 3,800 m. Rope teams of four. The guides set a pace that feels slow and never is.", stat: ["11", "certified guides"], side: "left" },
      { kicker: "04 — The summit push", title: "Leave at 2 a.m. Arrive for the light.", body: "Six hours to the top. The cloud sea fills the valleys below and the sun comes up through it from the east.", stat: ["4,506 m", "summit elevation"], side: "right" },
      { kicker: "05 — Join a team", title: "Dates are open. Teams cap at eight.", body: "Every team gets a pre-trip fitness plan, full kit list and a guide call. Book now, decide on gear later.", side: "center" },
    ],
    nav: { pricing: "Trips", signin: "Climber sign-in", reserve: "Book", account: "Expedition" },
    pose: { pricing: 0.24, signin: 0.03, reserve: 0.46, account: 0.92 },
    techniques: ["Procedural ridged-noise terrain, flat-shaded", "Height, slope and snow-line vertex colours", "Spline rail that follows the valley floor", "Layered shader cloud decks", "Warm point lights at each camp", "Waving shader flag at the summit"],
    pricing: {
      eyebrow: "Trips", title: "Pick your altitude.", lead: "Same guides, same safety standard. The difference is how high you go and how long you stay out.",
      toggle: ["Join a team", "Private group"], unit: ["per climber", "per climber, 4+"], note: "Private groups of four or more get the lower rate per climber.",
      plans: [
        { id: "trek", name: "Valley Trek", price: [1900, 1620], blurb: "Six days through the valley and up to second camp.", features: ["6 days, 2 camps", "Guide + porters", "All meals", "Up to 3,200 m"] },
        { id: "ascent", name: "Ridge Ascent", price: [3400, 2900], blurb: "Nine days. Crampons, ropes and the high ridge.", hot: true, features: ["9 days, 3 camps", "Rope-team instruction", "Technical kit included", "Up to 3,900 m", "Summit-view bivouac"] },
        { id: "summit", name: "Summit", price: [5800, 4900], blurb: "Twelve days and the top, with a rest day built in.", features: ["12 days, full acclimatisation", "1:2 guide ratio", "Satellite messenger", "4,506 m summit push", "Certificate & flag photo"] },
      ],
      faq: [["Do I need experience?", "Not for the Trek. Ascent and Summit need a fitness check and one training weekend."], ["What if weather closes the summit?", "We hold a spare day. If it still closes, you get a free second attempt next season."], ["Is kit included?", "Technical kit (crampons, helmet, harness) yes. Boots and clothing are yours."]],
    },
    signin: { title: "Sign in, climber.", lead: "Pick up your kit list, training plan and team chat where you left off.", cta: "Continue", quote: ["We were above the cloud sea at 6:10 a.m. with the sun coming up through it. I cried and so did the guide.", "Jonas & Hanne — Summit team, 2025"] },
    reserve: {
      title: "Book your team.", lead: "Choose a trip, a start date and a team size. A deposit is taken after the guide call.", dateLabel: "Start date", partyLabel: "Climbers", partyMax: 8,
      mult: "party", extraMult: "party", unit: "climber", confirm: "You are on the rope.",
      extras: [{ id: "kit", label: "Full technical kit", price: 180 }, { id: "ins", label: "Evacuation insurance", price: 140 }, { id: "photo", label: "Summit photo pack", price: 60 }, { id: "bag", label: "Down sleeping bag hire", price: 90 }],
    },
    account: {
      title: "Expedition", stats: [["Days to departure", "47", "Ridge Ascent"], ["Training plan", "62%", "week 5 of 8"], ["Kit checked", "14/21", "7 to go"]],
      chartLabel: "Training — hours per week", chart: [3, 4, 4, 5, 6, 6, 7, 5],
      listLabel: "Your team", items: [["Hanne L. · lead climber", "Joined Jan", "Confirmed"], ["Jonas V.", "Joined Jan", "Confirmed"], ["Open place", "1 left", "Invite"]],
    },
  },
  {
    slug: "tidewell",
    name: "Tidewell",
    wordmark: "TIDEWELL 300",
    tagline: "A dive watch built for where the light stops.",
    blurb: "Descend 300 metres with a dive watch in a rising, lit abyss. Surface light fades as you sink, the dial lights its markers with depth, and the case turns in the dark. A product bundle: cinematic landing, models, a sign-in, an order flow and a dive log in deep teal and lume green.",
    category: "Product · Dive watch",
    gpu: "Heavy",
    theme: { accent: "#7affd0", accent2: "#3fd9c4", bg: "#03080d", fg: "#eefaf9", muted: "#7c9aa0", card: "#071820", display: GROT, radius: 12 },
    hero: { kicker: "Tidewell 300 · pressure test", sub: "Rated to 300 metres. Lit to the last marker, however deep the light goes.", cta: "Reserve yours", hint: "Scroll to descend" },
    chapters: [
      { kicker: "01 — Surface", title: "Light breaks on the steel.", body: "Sun falls through the water in long shafts. The case takes it first, then gives it back in a single line.", side: "left" },
      { kicker: "02 — Descent", title: "The dark arrives as you sink.", body: "Every marker on the dial stays unlit until the depth reaches it, then glows for as long as you need to read it.", stat: ["300 m", "tested depth rating"], side: "right" },
      { kicker: "03 — The dial", title: "Lume that charges with depth.", body: "A rotating bezel, a sapphire crystal and markers that drink the surface light and hold it in the abyss.", stat: ["120", "minute bezel clicks"], side: "left" },
      { kicker: "04 — The abyss", title: "Built to be read in the dark.", body: "A titanium case, a rubber strap and a movement that keeps time through a long dive and the long climb back.", stat: ["±2 s", "daily accuracy"], side: "right" },
      { kicker: "05 — Reserve", title: "Wear the deep.", body: "Limited to a single run of pieces. Reserve yours now and it ships in a sealed case.", side: "center" },
    ],
    nav: { pricing: "Models", signin: "Dive log", reserve: "Reserve", account: "Collection" },
    pose: { pricing: 0.3, signin: 0.04, reserve: 0.8, account: 0.93 },
    techniques: ["Procedural dial with depth-lit markers", "Rising light shafts keyed to the playhead", "Rounded-box case and rubber strap", "Studio PMREM environment on steel", "Mirror floor reflection", "Portrait rail for phones"],
    pricing: {
      eyebrow: "Models", title: "Three depths of commitment.", lead: "Same movement and lume. Choose the case and the strap for the water you dive.",
      toggle: ["Buy outright", "12-month plan"], unit: ["one-time", "per month × 12"], note: "Plans include the Dive log app and a free strap change each year.",
      plans: [
        { id: "shore", name: "Shore", price: [690, 60], blurb: "Steel case, rubber strap. Everyday depth.", features: ["Brushed steel case", "100 m rating", "Rubber strap", "Dive log app"] },
        { id: "abyss", name: "Abyss", price: [1290, 112], blurb: "Titanium case, sapphire crystal, the full lume.", hot: true, features: ["Grade 5 titanium", "300 m rating", "Sapphire crystal", "Charging lume", "Dive log app included"] },
        { id: "trench", name: "Trench Pro", price: [2490, 216], blurb: "Limited run with a sealed case and service plan.", features: ["Limited numbered run", "300 m rating", "Sealed presentation case", "Lifetime service", "Priority strap changes"] },
      ],
      faq: [["Is it waterproof?", "Yes. Tested to 300 m. Service it every five years to keep the seal."], ["Does it need a battery?", "No. It is a mechanical movement that runs for about 60 hours on a full wind."], ["Can I return it?", "30 days, free return label."]],
    },
    signin: { title: "Open the dive log.", lead: "Sign in to see your dives, depth records and service dates.", cta: "Sign in", quote: ["The markers light as you go down. It feels like the watch knows where you are.", "Marta L. — diver, 40 m"] },
    reserve: {
      title: "Reserve your Tidewell.", lead: "Pick a case and a strap. Nothing is charged today.", dateLabel: "Earliest ship date", qtyLabel: "Watches", qtyMax: 3,
      mult: "qty", extraMult: "qty", unit: "watch", confirm: "Your Tidewell is reserved.",
      extras: [{ id: "strap", label: "Spare strap", price: 80 }, { id: "case", label: "Sealed case", price: 120 }, { id: "service", label: "Service plan (2 yr)", price: 150 }],
    },
    account: {
      title: "Collection", stats: [["Dives logged", "42", "all time"], ["Max depth", "238 m", "personal best"], ["Next service", "Mar 2027", "scheduled"]],
      chartLabel: "Depth per dive — last 12 dives", chart: [38, 52, 40, 61, 75, 58, 90, 84, 66, 102, 96, 118],
      listLabel: "Your watches", items: [["Tidewell Abyss", "Titanium · 300 m", "Active"], ["Tidewell Shore", "Steel · 100 m", "Spare"]],
    },
  },
];

export const bundleBySlug = (s: string) => BUNDLES.find((b) => b.slug === s);
export const PAGE_KEYS: PageKey[] = ["pricing", "signin", "reserve", "account"];
