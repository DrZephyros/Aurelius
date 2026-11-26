import { PROMPTS, type Prompt } from "./prompts";

/* The vibecoder prompt library. Works with any AI coding tool (Claude Code, Cursor, Copilot, Windsurf, Lovable, Bolt…).
   Anything in [SQUARE BRACKETS] becomes a fill-in field on the Prompts page. */

export type LibPrompt = {
  id: string;
  category: string;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  /** true → one of the original template-customisation prompts that ship in every zip */
  template?: boolean;
};

export const CATEGORIES = [
  "Kickoff",
  "UI & Design",
  "Debugging",
  "Refactor & Quality",
  "Backend & Data",
  "Testing",
  "Performance",
  "SEO & Launch",
  "Security",
  "Agent Setup",
  "Template tweaks",
] as const;

const P = (id: string, category: string, title: string, summary: string, body: string, tags: string[] = []): LibPrompt => ({ id, category, title, summary, body, tags });

export const LIBRARY: LibPrompt[] = [
  /* ───────── Kickoff ───────── */
  P("prd", "Kickoff", "Idea → mini PRD", "Turn a vague idea into a spec the AI can actually build from.",
    `I want to build [APP IDEA] for [TARGET USER]. Before writing any code, act as a product manager and write a one-page PRD: 1) the problem in two sentences, 2) the three must-have features for v1 (and what is explicitly OUT of scope), 3) the main user flow as numbered steps, 4) the data model as a simple list of entities and fields, 5) open questions you need me to answer. Keep it short. Wait for my answers before building anything.`, ["planning", "spec"]),
  P("scaffold", "Kickoff", "Scaffold the project", "A clean starting structure with the stack you choose.",
    `Scaffold a new [React + Vite + TypeScript + Tailwind] project for [APP NAME]. Create a sensible folder structure (components, pages, lib, hooks), a router with [3] placeholder pages, a shared layout with nav + footer, and a single design-token file for colours, radius and spacing. No placeholder lorem ipsum — use realistic copy for [APP IDEA]. Make sure it builds with no errors and tell me the exact commands to run it.`, ["setup", "react"]),
  P("one-feature", "Kickoff", "Build one feature at a time", "Stops the AI from rewriting the whole app.",
    `Implement exactly one feature: [FEATURE]. Rules: only touch the files that are strictly needed, do not refactor unrelated code, do not rename existing exports, and do not add new dependencies without asking. First list the files you plan to change and why, then make the change, then explain in three bullets how I can test it manually.`, ["scope", "safe"]),
  P("mvp-cut", "Kickoff", "Cut the scope to an MVP", "Ruthlessly trim a feature list to what ships this week.",
    `Here is my feature list: [FEATURE LIST]. I have [TIME AVAILABLE] and I am building alone with AI help. Sort the features into: Ship first (the smallest thing a real user would pay for or use daily), Ship second, and Cut. Justify each cut in one line and suggest a fake-it-first version (manual process, hard-coded data, third-party service) for anything in the first bucket that is expensive to build.`, ["planning"]),
  P("tech-choice", "Kickoff", "Pick the boring stack", "Get a decisive recommendation, not a menu.",
    `I am building [APP IDEA]. I know [YOUR SKILLS] and I want to deploy for free or very cheap. Recommend ONE stack (frontend, backend, database, auth, hosting) and explain in under 150 words why it beats the two nearest alternatives for my case. Prefer popular, well-documented tools that AI coding assistants are good at. Finish with a 5-step build order.`, ["stack"]),

  /* ───────── UI & Design ───────── */
  P("ui-polish", "UI & Design", "Make this UI look professional", "A concrete design pass instead of 'make it prettier'.",
    `Review the UI of [PAGE OR COMPONENT] like a senior product designer and improve it without changing functionality. Fix: spacing rhythm (use a 4/8px scale), type hierarchy (max 3 sizes per view), colour contrast (WCAG AA), alignment, and empty/loading/error states. Add subtle hover and focus states. Do not add new libraries. List every change you made at the end.`, ["design", "polish"]),
  P("responsive", "UI & Design", "Fix mobile layout", "Make it actually usable at 375px.",
    `Make [PAGE OR COMPONENT] fully responsive. Test mentally at 375px, 768px and 1280px. Use mobile-first Tailwind classes, avoid fixed widths, make tap targets at least 44px, stack columns on small screens, make tables scroll horizontally inside their own container, and ensure nothing overflows the viewport horizontally. Show me a before/after list of what changed.`, ["mobile", "tailwind"]),
  P("design-system", "UI & Design", "Extract a mini design system", "One source of truth for colours, type and components.",
    `Audit the project and extract a small design system: CSS variables / Tailwind theme tokens for colours, radius, shadows and font sizes; then Button, Input, Card and Badge components with variants ([PRIMARY, SECONDARY, GHOST]). Replace repeated one-off styles with these components across the app. Keep visual output identical unless something was clearly inconsistent.`, ["design", "refactor"]),
  P("dark-mode", "UI & Design", "Add dark mode properly", "Tokens, toggle, persistence, no flash.",
    `Add dark mode: define semantic colour tokens (background, surface, text, muted, border, accent) for light and dark, apply them everywhere instead of hard-coded colours, add a toggle in the nav that respects prefers-color-scheme by default, persists in localStorage, and avoids a flash of the wrong theme on load. Check contrast in both themes.`, ["theme"]),
  P("empty-states", "UI & Design", "Empty, loading & error states", "The states AI always forgets.",
    `For every list, table and data-fetching view in [AREA OF APP], add: a skeleton loading state, a friendly empty state with a clear primary action, and an error state with a retry button and a plain-language message. Keep them visually consistent using one shared component for each.`, ["ux"]),
  P("copywriting", "UI & Design", "Rewrite UI copy", "Replace robotic copy with clear, human microcopy.",
    `Rewrite all user-facing text in [PAGE OR FLOW] for [TARGET USER]. Tone: [TONE]. Rules: buttons start with a verb, errors say what happened and how to fix it, no jargon, no exclamation marks, headings under 8 words. Return only a table of old text → new text first, then apply the changes.`, ["copy", "ux"]),
  P("landing", "UI & Design", "Landing page that converts", "A real structure, not a pile of sections.",
    `Build a landing page for [PRODUCT] aimed at [TARGET USER]. Structure: hero with one clear promise + primary CTA, social proof strip, 3 benefits (not features), how it works in 3 steps, one objection-handling FAQ, final CTA. Write the copy yourself in a [TONE] voice, make the hero fast to read in 5 seconds, and keep it to one primary action per screen.`, ["marketing"]),

  /* ───────── Debugging ───────── */
  P("debug-error", "Debugging", "Debug this error", "The structured way to hand an error to an AI.",
    `I'm getting this error:\n\n[PASTE ERROR AND STACK TRACE]\n\nContext: it happens when [WHAT YOU DID]. I expected [EXPECTED]. Relevant file(s): [FILES]. Do not guess. First explain the most likely root cause in plain language, name the exact line/file, then give the smallest possible fix. If you need more information, ask me for it instead of rewriting code.`, ["error", "fix"]),
  P("debug-nothing", "Debugging", "It runs but does nothing", "When there's no error to paste.",
    `The feature [FEATURE] silently does nothing: no error in the console, no network request. Add temporary console.log statements at each step of the flow (event handler → state update → request → response → render), tell me what output to expect at each point, and I'll paste the logs back so we can find where it stops. Don't change any behaviour yet.`, ["no-error"]),
  P("debug-regression", "Debugging", "It worked before, now it's broken", "Find what changed instead of rewriting.",
    `[FEATURE] worked earlier and is broken now. The last thing I changed was [LAST CHANGE]. Look at the recent changes in the files involved, identify which edit most likely caused the regression, and propose a minimal revert or fix. Do not rewrite the feature from scratch.`, ["regression"]),
  P("rubber-duck", "Debugging", "Explain this code to me", "Understand AI-written code before you ship it.",
    `Explain [FILE OR FUNCTION] to me like I'm a smart beginner. Cover: what it does in one sentence, the step-by-step flow, what each external call or library is doing, any bugs or risky assumptions you notice, and what I would need to change to [CHANGE I WANT]. Use short sections and no filler.`, ["learning"]),
  P("stuck-loop", "Debugging", "Break the fix-it loop", "When the AI keeps 'fixing' the same bug.",
    `We've tried to fix [PROBLEM] several times and it keeps failing. Stop. Do not write any code yet. List what we've already tried and why each attempt failed, list three different hypotheses for the root cause ordered by likelihood, and for each give me one cheap experiment that would prove or disprove it. Then wait for me to choose.`, ["loop"]),
  P("react-rerender", "Debugging", "Fix infinite re-renders", "Classic React loop and stale-state issues.",
    `[COMPONENT] re-renders in a loop / shows stale data. Review its hooks: look for state set during render, effects with missing or unstable dependencies, objects/functions recreated every render, and derived state that should be computed instead. Explain which one is the culprit, then fix it with the smallest change.`, ["react"]),

  /* ───────── Refactor & Quality ───────── */
  P("refactor-safe", "Refactor & Quality", "Refactor without breaking anything", "Cleaner code, identical behaviour.",
    `Refactor [FILE OR MODULE] for readability and maintainability with identical behaviour. Split anything over ~150 lines, remove duplication, give variables and functions intention-revealing names, add types where missing, and delete dead code. Do not change public APIs or visible UI. After the refactor, list the behaviours I should manually re-test.`, ["clean-up"]),
  P("review", "Refactor & Quality", "Code review like a senior dev", "Find bugs and risks before they find you.",
    `Review [FILE OR DIFF] as a strict senior engineer. Output a prioritised list: 1) bugs that will happen, 2) security or data-loss risks, 3) performance traps, 4) maintainability issues. For each give file:line, why it matters, and a concrete fix. Skip style nitpicks. If it's genuinely fine, say so.`, ["review"]),
  P("typescript", "Refactor & Quality", "Tighten the TypeScript", "Remove any, add real types.",
    `Strengthen the TypeScript in [AREA]: remove every 'any' and non-null assertion that isn't justified, add proper types for API responses and component props, use discriminated unions for loading/success/error state, and enable no new tsconfig loosening. Keep runtime behaviour identical and make sure the project still type-checks.`, ["typescript"]),
  P("delete-code", "Refactor & Quality", "Find and delete dead code", "AI apps accumulate junk. Clean it.",
    `Find unused files, components, exports, CSS classes, dependencies and commented-out blocks in this project. Present them as a checklist grouped by confidence (certainly unused / probably unused / unsure). Delete only the 'certainly unused' ones after I approve, and make sure the build still passes.`, ["clean-up"]),
  P("readme", "Refactor & Quality", "Write a README that helps", "For future you and for the AI.",
    `Write a README for this project: one-paragraph description, screenshot placeholder, tech stack, how to install and run (exact commands), environment variables table (name, purpose, example — no real secrets), folder structure overview, how to deploy, and a short 'how this works' section for new contributors. Be accurate — read the code instead of guessing.`, ["docs"]),

  /* ───────── Backend & Data ───────── */
  P("schema", "Backend & Data", "Design the database schema", "Tables, relations and indexes from your features.",
    `Design a [Postgres] schema for [APP IDEA] with these features: [FEATURE LIST]. Give me: tables with columns and types, primary/foreign keys, indexes for the queries I'll actually run, row-level security / ownership rules, and the SQL to create it. Explain any normalisation trade-off in one line. Do not invent features I didn't list.`, ["database", "sql"]),
  P("crud-api", "Backend & Data", "Build a typed CRUD API", "Endpoints with validation and proper errors.",
    `Create CRUD endpoints for [RESOURCE] in [FRAMEWORK]. Validate input with [ZOD / PYDANTIC], return consistent JSON ({ data } or { error: { code, message } }), use correct status codes, paginate list endpoints, and never trust client-supplied ownership fields. Add a short curl example for each endpoint.`, ["api"]),
  P("auth", "Backend & Data", "Add authentication", "Sign-up, login, sessions and protected routes.",
    `Add authentication using [SUPABASE AUTH / AUTH.JS / CLERK]. Include sign-up, login, logout, password reset, a protected-route wrapper that redirects unauthenticated users, and showing the current user in the nav. Keep secrets in environment variables, give me a .env.example, and explain exactly which dashboard settings I need to configure.`, ["auth"]),
  P("stripe", "Backend & Data", "Add Stripe payments", "Checkout, webhooks and access control.",
    `Integrate Stripe Checkout for [ONE-TIME PURCHASE / SUBSCRIPTION] of [PRODUCT]. Create the checkout session on the server, handle the webhook for checkout.session.completed (verify the signature), store the purchase against the user, and gate access in the app based on that record — never on a client-side flag. Give me the test-mode steps and the env vars I need.`, ["payments"]),
  P("env", "Backend & Data", "Handle env vars & secrets", "Stop leaking keys into the client.",
    `Audit how this project uses environment variables and secrets. Make sure no private key is exposed to the browser bundle (check VITE_ / NEXT_PUBLIC_ prefixes), move privileged calls behind a server function, add a .env.example with every variable documented, ensure .env is git-ignored, and list any key I should rotate because it was already committed.`, ["secrets"]),
  P("migrate-data", "Backend & Data", "Move from localStorage to a real DB", "Persist user data properly.",
    `The app currently stores [DATA] in localStorage. Move it to [SUPABASE / FIREBASE / SQLITE]: define the table/collection, write a data-access layer so components never call the database directly, add optimistic updates with rollback on error, and write a one-time migration that imports existing localStorage data for returning users.`, ["database"]),

  /* ───────── Testing ───────── */
  P("tests", "Testing", "Write tests for what matters", "Not 100% coverage — the risky 20%.",
    `Add tests with [VITEST + TESTING LIBRARY] for the highest-risk logic in [AREA]: pure functions, validation, state transitions and anything that handles money or permissions. Test behaviour, not implementation details. For each test name describe the user-visible outcome. Don't test trivial markup. Report which important paths remain untested.`, ["testing"]),
  P("e2e", "Testing", "Playwright smoke test", "One test that proves the app basically works.",
    `Write a Playwright end-to-end smoke test for the core flow: [STEP 1 → STEP 2 → STEP 3]. Use accessible locators (getByRole, getByLabel), no arbitrary sleeps, seed any required data, and make it runnable with a single npm script. Add one more test that checks the page has no console errors on load.`, ["e2e"]),
  P("edge-cases", "Testing", "Think of the edge cases", "Break your own feature before users do.",
    `List the 15 most likely ways [FEATURE] could break in production: empty input, huge input, double-clicks, slow network, offline, expired session, unusual unicode, timezone issues, concurrent edits. For each, say whether the current code handles it, and fix the ones that are cheap to fix.`, ["qa"]),

  /* ───────── Performance ───────── */
  P("perf-react", "Performance", "Speed up the React app", "Measure first, then fix.",
    `Make [APP OR PAGE] faster. First identify the real bottlenecks by reading the code: unnecessary re-renders, expensive work in render, large lists without virtualisation, unoptimised images, big dependencies imported for tiny uses. Then fix the top three with minimal code and explain the expected gain. Don't add useMemo/useCallback everywhere — only where it matters.`, ["performance", "react"]),
  P("bundle", "Performance", "Shrink the bundle", "Lazy-load and drop heavy imports.",
    `Analyse bundle size for this Vite project. Find the largest dependencies, replace heavy ones with lighter alternatives or native APIs where reasonable, lazy-load routes and rarely used components with React.lazy, and import only what's needed from libraries. Report the before/after size.`, ["bundle"]),
  P("images", "Performance", "Fix image performance", "Right size, right format, lazy.",
    `Optimise images across the site: convert to WebP/AVIF where possible, set explicit width/height to prevent layout shift, use loading="lazy" below the fold, use srcset for responsive sizes, and eager-load only the hero image. List every image changed and the estimated saving.`, ["images"]),

  /* ───────── SEO & Launch ───────── */
  P("seo", "SEO & Launch", "SEO + social sharing", "Titles, meta, Open Graph and sitemap.",
    `Add SEO basics to [SITE]: unique <title> and meta description per page (under 60 / 155 chars), canonical URLs, Open Graph and Twitter card tags with an image placeholder, semantic HTML headings (one h1 per page), descriptive alt text, a sitemap.xml, robots.txt and JSON-LD structured data for [ORGANISATION / PRODUCT / ARTICLE]. Write the copy for [TARGET KEYWORD].`, ["seo"]),
  P("launch-checklist", "SEO & Launch", "Pre-launch audit", "Catch the embarrassing stuff before day one.",
    `Do a pre-launch audit of this project. Check: broken links, console errors, missing alt text, form validation, mobile layout, 404 page, favicon, page titles, accessibility basics (keyboard + contrast), loading states, analytics, environment variables set for production, and error monitoring. Output a pass/fail checklist and fix every cheap item.`, ["launch"]),
  P("deploy-vercel", "SEO & Launch", "Deploy step-by-step", "From localhost to a live URL.",
    `Walk me through deploying this project to [VERCEL / NETLIFY / CLOUDFLARE PAGES] step by step: the build command, output directory, required environment variables, SPA routing fallback, custom domain with HTTPS, and how to set up preview deployments from pull requests. Add any config file that's needed and tell me how to verify it worked.`, ["deploy"]),
  P("analytics", "SEO & Launch", "Add privacy-friendly analytics", "Know what users do without a cookie banner.",
    `Add [PLAUSIBLE / UMAMI / POSTHOG] analytics to [SITE]. Track page views plus these custom events: [EVENTS e.g. signup_clicked, checkout_started]. Wrap it in a small analytics.ts helper so events are one-line calls, respect Do Not Track, and don't load in development.`, ["analytics"]),

  /* ───────── Security ───────── */
  P("security", "Security", "Security review for AI-built apps", "The mistakes vibe-coded apps ship with.",
    `Security-audit this app. Check: secrets in client code or git history, missing authorisation checks on every API route (not just authentication), SQL/NoSQL injection, XSS from dangerouslySetInnerHTML or unsanitised input, CSRF, open CORS, missing rate limiting on auth and expensive endpoints, insecure file upload handling, and over-permissive database rules. Rank findings by severity with exact file references and fixes.`, ["audit"]),
  P("rls", "Security", "Lock down database access", "Row-level security that actually works.",
    `Review the database access rules for [SUPABASE / FIREBASE]. Write row-level security policies so users can only read and write their own rows in [TABLES], admins can read everything, and anonymous users get nothing unless explicitly allowed. Show the policies, then a test query for each case proving it works and a query proving the wrong user is blocked.`, ["database"]),
  P("input-validation", "Security", "Validate every input", "Client and server, with one shared schema.",
    `Add schema validation with [ZOD] to every form and API route in [AREA]. Share the schemas between client and server, return field-level error messages the UI can display, sanitise text before it's rendered or stored, enforce length limits, and reject unexpected fields.`, ["validation"]),

  /* ───────── Agent Setup ───────── */
  P("agent-rules", "Agent Setup", "Write my CLAUDE.md / AGENTS.md", "Teach the AI your project once.",
    `Read this project and write an AGENTS.md (under 80 lines) for AI coding tools: what the app does, the exact stack and versions, folder map, commands to run/build/test, coding conventions you can see in the existing code, things that must never be changed without asking ([PROTECTED AREAS]), and the definition of 'done' (build passes, no type errors, manual test steps). Be specific to this repo, not generic advice.`, ["rules", "context"]),
  P("context-summary", "Agent Setup", "Summarise context for a fresh chat", "Reset a long, confused session without losing progress.",
    `Summarise this conversation so I can paste it into a brand-new chat: the goal, decisions made and why, the current state of the code (files changed, what works, what's broken), the exact next step, and any constraints I gave you. Under 300 words, no pleasantries.`, ["context"]),
  P("plan-first", "Agent Setup", "Plan before coding", "Make the AI show its plan and wait.",
    `Before you write any code for [TASK]: restate the task in your own words, list the files you'll read, the files you'll change, the risks, and a numbered step plan. Then stop and wait for my approval. After approval, work through the plan one step at a time and tell me when each step is done.`, ["planning", "safe"]),
  P("commit-msg", "Agent Setup", "Commit message + changelog", "Clear history for the next time something breaks.",
    `Look at the current uncommitted changes and write a conventional commit message (type(scope): summary, under 72 chars) plus a short body explaining why, not what. Then suggest whether this should be split into smaller commits, and list them if so.`, ["git"]),
];

/** The original per-template prompts that ship in every zip's PROMPTS.md, presented in the same library. */
const TEMPLATE_PROMPTS: LibPrompt[] = PROMPTS.map((p: Prompt) => ({
  id: "tpl-" + p.id,
  category: "Template tweaks",
  title: p.title,
  summary: p.summary,
  body: p.body.replaceAll("{name}", "this template"),
  tags: [p.category.toLowerCase(), "3d"],
  template: true,
}));

export const ALL_PROMPTS: LibPrompt[] = [...LIBRARY, ...TEMPLATE_PROMPTS];

/** Unique [bracket] fields in a prompt, in order of appearance. */
export function fieldsOf(body: string): string[] {
  return [...new Set([...body.matchAll(/\[([^\]\n]{2,70})\]/g)].map((m) => m[1]))];
}

/** Replace [FIELD] placeholders that have a non-empty value. */
export function fillFields(body: string, values: Record<string, string>): string {
  return body.replace(/\[([^\]\n]{2,70})\]/g, (m, k: string) => (values[k]?.trim() ? values[k].trim() : m));
}
