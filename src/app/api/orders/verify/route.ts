import { eq } from "drizzle-orm";
import { db } from "@/db";
import { skillOrders } from "@/db/schema";

export const dynamic = "force-dynamic";

/** After Stripe redirects back: confirm the session is paid, then hand back the download token. */
export async function GET(req: Request) {
  const sid = new URL(req.url).searchParams.get("session_id");
  const key = process.env.STRIPE_SECRET_KEY;
  if (!sid || !key) return Response.json({ error: "Missing session" }, { status: 400 });
  const [order] = await db.select().from(skillOrders).where(eq(skillOrders.stripeSessionId, sid)).limit(1);
  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "paid") {
    const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sid)}`, { headers: { Authorization: `Bearer ${key}` } });
    const s = (await r.json()) as { payment_status?: string };
    if (s.payment_status !== "paid") return Response.json({ error: "Payment not completed yet" }, { status: 402 });
    await db.update(skillOrders).set({ status: "paid" }).where(eq(skillOrders.id, order.id));
  }
  return Response.json({ token: order.token, email: order.email });
}
