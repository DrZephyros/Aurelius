import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/** One row per skill purchase. status: pending → paid (Stripe) | preview (no payment provider configured). */
export const skillOrders = pgTable("skill_orders", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  status: text("status").notNull().default("pending"),
  amountCents: integer("amount_cents").notNull().default(1000),
  stripeSessionId: text("stripe_session_id"),
  downloads: integer("downloads").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** "Request a website from me" submissions. */
export const siteRequests = pgTable("site_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  kind: text("kind"),
  budget: text("budget"),
  timeline: text("timeline"),
  brief: text("brief").notNull(),
  links: text("links"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
