import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');
    
    if (!customerId) {
      return NextResponse.json({ error: "customer_id required" }, { status: 400 });
    }

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 10,
    });

    return NextResponse.json({
      customer_id: customerId,
      subscriptions: subscriptions.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        cancel_at_period_end: sub.cancel_at_period_end,
        metadata: sub.metadata,
      }))
    });

  } catch (error) {
    console.error("Error retrieving subscriptions:", error);
    return NextResponse.json({ error: "Failed to retrieve subscriptions" }, { status: 500 });
  }
}
