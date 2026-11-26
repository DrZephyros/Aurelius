// One place to rename the product.
export const SITE = {
  name: "Aurelius",
  domain: "projectaurelius.dev",
  tagline: "The skill that makes AAA 3D websites",
  description:
    "AURA is an agent skill that teaches Claude, Codex or Cursor to design and build $10,000-grade, scroll-driven 3D websites — product renders, estates, portfolios, worlds — from a single prompt.",
};

export const SKILL = {
  name: "AURA",
  slug: "aura-3d-web",
  price: 19,
  priceLabel: "$19",
  version: "2.1",
};

/** The three tiers. The library is free forever; the skill is a one-time purchase; the build is done-for-you. */
export const TIERS = {
  library: { price: 0, label: "Free" },
  skill: { price: 19, label: "$19" },
  build: { price: 80, label: "$80", days: 5, revisions: 1 },
} as const;
