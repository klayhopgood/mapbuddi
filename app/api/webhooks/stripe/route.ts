import { addresses, products, sellerPayouts, stores } from "./../../../../db/schema";
import { db } from "@/db/db";
import { carts, orders, payments } from "@/db/schema";
import { CheckoutItem } from "@/lib/types";
import { SQL, eq, inArray, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Readable } from "stream";
import Stripe from "stripe";
import { handleSubscriptionWebhook } from "@/server-actions/subscription";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

async function getRawBody(readable: Readable): Promise<Buffer> {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function GET() {
  console.log("=== WEBHOOK GET REQUEST ===");
  return NextResponse.json({ 
    message: "Webhook endpoint is reachable",
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  // FIRST: Log that we received ANY request
  console.log("=== WEBHOOK ENDPOINT HIT ===");
  console.log("Request method:", request.method);
  console.log("Request URL:", request.url);
  console.log("Headers:", JSON.stringify(Object.fromEntries(request.headers.entries())));
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-08-27.basil",
  });

  console.log("=== GETTING RAW BODY ===");
  const rawBody = await getRawBody(request.body as unknown as Readable);
  console.log("Raw body length:", rawBody.length);

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
        }).returning();
        
        console.log("=== DIRECT PAYMENT ORDER CREATED ===");
        console.log("Order ID:", newOrder[0]?.id);
        console.log("Email:", paymentIntent.receipt_email);
        console.log("Cart ID:", cartId);
        console.log("Store ID:", storeId);

        // Create seller payout record
        const sellerAmount = parseFloat(paymentIntent.metadata.sellerReceives) / 100; // Convert cents to dollars
        const platformFeeAmount = parseFloat(paymentIntent.metadata.platformFee) / 100;
        const stripeFeeAmount = parseFloat(paymentIntent.metadata.stripeFee) / 100;

        // Get store owner ID
        const storeInfo = await db
          .select({ userId: stores.userId })
          .from(stores)
          .where(eq(stores.id, storeId));

        if (storeInfo.length && storeInfo[0].userId && newOrder[0]?.id) {
          const sellerPayoutRecord = await db.insert(sellerPayouts).values({
            storeId: storeId,
            orderId: newOrder[0].id,
            sellerId: storeInfo[0].userId,
            amount: sellerAmount.toString(),
            platformFee: platformFeeAmount.toString(),
            stripeFee: stripeFeeAmount.toString(),
            payoutMethod: "paypal", // Default to PayPal, will be updated based on seller preference
            status: "pending",
          });

          console.log("=== SELLER PAYOUT RECORD CREATED ===");
          console.log("Seller will receive:", "$" + sellerAmount.toFixed(2));
          console.log("Platform fee:", "$" + platformFeeAmount.toFixed(2));
          console.log("Stripe fee:", "$" + stripeFeeAmount.toFixed(2));
        }
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
    
    // Subscription events
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
    case "invoice.payment_failed":
      console.log(`=== SUBSCRIPTION EVENT: ${event.type} ===`);
      console.log(`Event ID: ${event.id}`);
      console.log(`Event created: ${new Date(event.created * 1000).toISOString()}`);
      console.log(`Event data preview:`, JSON.stringify(event.data.object, null, 2).substring(0, 500) + '...');
      try {
        await handleSubscriptionWebhook(event);
        console.log(`✅ Successfully processed ${event.type} for event ${event.id}`);
      } catch (error) {
        console.error(`❌ Error processing subscription event ${event.type}:`, error);
        console.error(`Event that failed:`, JSON.stringify(event, null, 2));
        return NextResponse.json(
          { error: `Failed to process ${event.type}` },
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
