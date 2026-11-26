import { randomBytes } from "node:crypto";
import { db } from "@/db";
import { skillOrders } from "@/db/schema";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Start a purchase. With STRIPE_SECRET_KEY set → a real Stripe Checkout session. Without → "preview" mode: the order is recorded and the download unlocks immediately. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string };
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!EMAIL.test(email)) return Response.json({ error: "Enter a valid email so we can send your receipt." }, { status: 400 });

  const token = randomBytes(24).toString("hex");
  const key = process.env.STRIPE_SECRET_KEY;
  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  if (!key) {
    await db.insert(skillOrders).values({ email, token, status: "preview" });
    return Response.json({ mode: "preview", url: `/skill/download?token=${token}&mode=preview` });
  }

  const form = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": "1000",
    "line_items[0][price_data][product_data][name]": "AURA — the 3D website skill",
    "line_items[0][price_data][product_data][description]": "Agent skill + starter engine + art directions + worked examples",
    success_url: `${origin}/skill/download?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/skill#get`,
    customer_email: email,
    client_reference_id: token,
  });
  const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: form,
  });
  const s = (await r.json()) as { id?: string; url?: string; error?: { message?: string } };
  if (!r.ok || !s.url || !s.id) return Response.json({ error: s.error?.message ?? "Payment provider error" }, { status: 502 });
  await db.insert(skillOrders).values({ email, token, status: "pending", stripeSessionId: s.id });
  return Response.json({ mode: "stripe", url: s.url });
}
