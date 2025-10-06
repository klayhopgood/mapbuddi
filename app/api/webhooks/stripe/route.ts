import { addresses, products } from "./../../../../db/schema";
import { db } from "@/db/db";
import { carts, orders, payments } from "@/db/schema";
import { CheckoutItem } from "@/lib/types";
import { SQL, eq, inArray, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Readable } from "stream";
import Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function getRawBody(readable: Readable): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function POST(request: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-08-27.basil",
  });

  const rawBody = await getRawBody(request.body as unknown as Readable);

  const headersList = headers();
  const sig = headersList.get("stripe-signature");
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig as string,
      endpointSecret as string
    );
  } catch (err: any) {
    console.log("=== WEBHOOK SIGNATURE ERROR ===", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  let dbUpdateCartResponse;
  // Handle the event
  switch (event.type) {
    case "payment_intent.payment_failed":
      const paymentIntentPaymentFailed = event.data.object;
      // Then define and call a function to handle the event payment_intent.payment_failed
      break;
    case "payment_intent.processing":
      const paymentIntentProcessing = event.data.object;
      // Then define and call a function to handle the event payment_intent.processing
      break;
    case "payment_intent.succeeded":
      const paymentIntentSucceeded = event.data.object;
      // Then define and call a function to handle the event payment_intent.succeeded
      // Mark cart as closed in DB

      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const paymentIntentId = paymentIntent.id;
      const orderTotal = paymentIntent.amount;
      const cartId = paymentIntent.metadata.cartId;
      const items = paymentIntent.metadata.items;

      try {
        // Get store ID from metadata (no Connect account needed)
        const storeId = parseInt(paymentIntent.metadata.storeId);
        
        if (!storeId) throw new Error("No store ID in payment metadata");

        // create new address in DB (if shipping address provided)
        const stripeAddress = paymentIntent.shipping?.address;
        let addressId = null;

        if (stripeAddress) {
          const newAddress = await db.insert(addresses).values({
            line1: stripeAddress?.line1,
            line2: stripeAddress?.line2,
            city: stripeAddress?.city,
            state: stripeAddress?.state,
            postal_code: stripeAddress?.postal_code,
            country: stripeAddress?.country,
          }).returning();

          addressId = newAddress[0]?.id;
        }

        // get current order count in DB
        const storeOrderCount = await db
          .select({ count: sql<number>`count(*)` })
          .from(orders)
          .where(eq(orders.storeId, storeId));

        // create new order in DB
        const newOrder = await db.insert(orders).values({
          prettyOrderId: Number(storeOrderCount[0].count) + 1,
          storeId: storeId,
          items: items,
          total: String(Number(orderTotal) / 100),
          stripePaymentIntentId: paymentIntentId,
          stripePaymentIntentStatus: paymentIntent.status,
          name: paymentIntent.shipping?.name || "Unknown",
          email: paymentIntent.receipt_email || "unknown@email.com",
          createdAt: event.created,
          addressId: addressId,
        });
        console.log("=== DIRECT PAYMENT ORDER CREATED ===");
        console.log("Order ID:", newOrder);
        console.log("Email:", paymentIntent.receipt_email);
        console.log("Cart ID:", cartId);
        console.log("Store ID:", storeId);
      } catch (err) {
        console.log("DIRECT PAYMENT ORDER ERROR", err);
      }

      try {
        // Close cart and clear items
        dbUpdateCartResponse = await db
          .update(carts)
          .set({
            isClosed: true,
            items: JSON.stringify([]),
          })
          .where(eq(carts.paymentIntentId, paymentIntentId));
      } catch (err) {
        console.log("WEBHOOK ERROR", err);
        return NextResponse.json(
          { response: dbUpdateCartResponse, error: err },
          { status: 500 }
        );
      }

      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  return NextResponse.json({ status: 200 });
}
