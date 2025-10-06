import { addresses, products } from "./../../../../../db/schema";
import { db } from "@/db/db";
import { carts, orders, payments } from "@/db/schema";
import { CheckoutItem } from "@/lib/types";
import { SQL, eq, inArray, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Readable } from "stream";
import Stripe from "stripe";

const endpointSecret = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;

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
    console.log("=== CONNECT WEBHOOK SIGNATURE ERROR ===", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  console.log("=== CONNECT WEBHOOK RECEIVED ===");
  console.log("Event type:", event.type);
  console.log("Account:", event.account);

  let dbUpdateCartResponse;
  // Handle the event
  switch (event.type) {
    case "payment_intent.payment_failed":
      const paymentIntentPaymentFailed = event.data.object;
      console.log("=== PAYMENT FAILED DEBUG ===");
      console.log("Payment failed:", paymentIntentPaymentFailed.id);
      console.log("Status:", paymentIntentPaymentFailed.status);
      console.log("Amount:", paymentIntentPaymentFailed.amount);
      console.log("Currency:", paymentIntentPaymentFailed.currency);
      console.log("Last Payment Error:", JSON.stringify(paymentIntentPaymentFailed.last_payment_error, null, 2));
      console.log("Metadata:", JSON.stringify(paymentIntentPaymentFailed.metadata, null, 2));
      console.log("Application Fee Amount:", paymentIntentPaymentFailed.application_fee_amount);
      console.log("Charges:", paymentIntentPaymentFailed.charges?.data?.map((charge: any) => ({
        id: charge.id,
        status: charge.status,
        failure_code: charge.failure_code,
        failure_message: charge.failure_message,
        outcome: charge.outcome
      })));
      console.log("=== END PAYMENT FAILED DEBUG ===");
      break;
    case "payment_intent.processing":
      const paymentIntentProcessing = event.data.object;
      console.log("Payment processing:", paymentIntentProcessing.id);
      break;
    case "payment_intent.succeeded":
      console.log("=== PAYMENT INTENT SUCCEEDED ===");
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const paymentIntentId = paymentIntent.id;
      const orderTotal = paymentIntent.amount;
      const cartId = paymentIntent.metadata.cartId;
      const items = paymentIntent.metadata.items;

      console.log("Payment Intent ID:", paymentIntentId);
      console.log("Cart ID:", cartId);
      console.log("Items:", items);
      console.log("Account:", event.account);

      try {
        if (!event.account) throw new Error("No account on event");
        const store = await db
          .select({
            storeId: payments.storeId,
          })
          .from(payments)
          .where(eq(payments.stripeAccountId, event.account));

        if (!store.length) {
          throw new Error(`No store found for account ${event.account}`);
        }

        const storeId = store[0].storeId as number;
        console.log("Store ID:", storeId);

        // create new address in DB
        const stripeAddress = paymentIntent.shipping?.address;

        const newAddress = await db.insert(addresses).values({
          line1: stripeAddress?.line1,
          line2: stripeAddress?.line2,
          city: stripeAddress?.city,
          state: stripeAddress?.state,
          postal_code: stripeAddress?.postal_code,
          country: stripeAddress?.country,
        }).returning();

        if (!newAddress[0]?.id) throw new Error("No address created");
        console.log("Address created:", newAddress[0].id);

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
          name: paymentIntent.shipping?.name,
          email: paymentIntent.receipt_email,
          createdAt: event.created,
          addressId: newAddress[0].id,
        }).returning();
        
        console.log("=== ORDER CREATED SUCCESSFULLY ===");
        console.log("Order ID:", newOrder[0]?.id);
        console.log("Pretty Order ID:", newOrder[0]?.prettyOrderId);
        console.log("Email:", paymentIntent.receipt_email);
      } catch (err) {
        console.log("=== ORDER CREATION WEBHOOK ERROR ===", err);
        return NextResponse.json(
          { error: "Order creation failed", details: err },
          { status: 500 }
        );
      }

      try {
        // Close cart and clear items - find cart by payment intent ID
        console.log("Closing cart with payment intent:", paymentIntentId);
        const cartUpdateResult = await db
          .update(carts)
          .set({
            isClosed: true,
            items: JSON.stringify([]),
          })
          .where(eq(carts.paymentIntentId, paymentIntentId))
          .returning();
        
        console.log("Cart update result:", cartUpdateResult);
        if (cartUpdateResult.length > 0) {
          console.log("Cart closed successfully, cart ID:", cartUpdateResult[0].id);
        } else {
          console.log("WARNING: No cart found with payment intent:", paymentIntentId);
        }
      } catch (err) {
        console.log("=== CART UPDATE WEBHOOK ERROR ===", err);
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
  return NextResponse.json({ status: 200, received: true });
}
