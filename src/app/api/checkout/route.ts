import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { amount } = await req.json();

    const cents = Math.round(Number(amount) * 100);
    if (!cents || cents < 50) {
      return NextResponse.json(
        { error: "Minimum deposit is $0.50" },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "YieldPets Deposit",
              description: `$${(cents / 100).toFixed(2)} deposit to your pet's balance`,
            },
            unit_amount: cents,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}?deposit_success=1&amount=${cents}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}?deposit_cancelled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("Stripe checkout error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
