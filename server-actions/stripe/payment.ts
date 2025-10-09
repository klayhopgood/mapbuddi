"use server";

import { db } from "@/db/db";
import { carts, payments, stores } from "@/db/schema";
import { platformFeeDecimal } from "@/lib/application-constants";
import { CheckoutItem } from "@/lib/types";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { getStoreId } from "../store-details";

export async function createPaymentIntent({
  items,
  storeId,
}: {
  items: CheckoutItem[];
  storeId: number;
}) {
  console.log("=== CREATE PAYMENT INTENT DEBUG ===");
  console.log("Items:", items);
  console.log("Store ID:", storeId);
  console.log("Stripe key exists:", !!process.env.STRIPE_SECRET_KEY);
  
  try {
    // This is your test secret API key.
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-08-27.basil",
    });
    console.log("Stripe client created successfully");

    const cartId = Number(cookies().get("cartId")?.value);
    console.log("Cart ID:", cartId);

    // Always use USD for payments
    const currency = "usd";
    
    console.log("Calculating order amounts...");
    const { orderTotal, platformFee, stripeFee, sellerReceives } = calculateOrderAmounts(items);
    console.log("Order amounts calculated successfully");

    const metadata = {
      cartId: isNaN(cartId) ? "" : cartId.toString(),
      items: JSON.stringify(items),
      storeId: storeId.toString(), // Track which store this payment is for
      platformFee: platformFee.toString(), // Track platform fee
      stripeFee: stripeFee.toString(), // Track Stripe fee  
      sellerReceives: sellerReceives.toString(), // Track what seller should get
    };

    // check if cartid has a paymentIntent already
    if (!isNaN(cartId)) {
      const paymentIntent = await db
        .select({
          paymentIntentId: carts.paymentIntentId,
          clientSecret: carts.clientSecret,
        })
        .from(carts)
        .where(eq(carts.id, cartId));

      if (paymentIntent.length && paymentIntent[0]?.clientSecret && paymentIntent[0]?.paymentIntentId) {
        try {
          // Check if the PaymentIntent is still updateable (not completed/captured)
          const existingPaymentIntent = await stripe.paymentIntents.retrieve(
            paymentIntent[0].paymentIntentId
          );
        
          // Only update if PaymentIntent is still in a pending state
          if (existingPaymentIntent.status === 'requires_payment_method' || 
              existingPaymentIntent.status === 'requires_confirmation' ||
              existingPaymentIntent.status === 'requires_action') {
            await stripe.paymentIntents.update(
              paymentIntent[0].paymentIntentId,
              {
                amount: orderTotal,
                currency: currency,
                metadata,
              }
            );
            return { clientSecret: paymentIntent[0].clientSecret };
          } else {
            // PaymentIntent is completed - clear it from cart and create new one
            console.log("PaymentIntent already completed, creating new one. Status:", existingPaymentIntent.status);
            await db
              .update(carts)
              .set({
                paymentIntentId: null,
                clientSecret: null,
              })
              .where(eq(carts.id, cartId));
          }
        } catch (stripeError) {
          // PaymentIntent doesn't exist or can't be retrieved - clear it and create new one
          console.log("PaymentIntent not found or invalid, clearing and creating new one:", stripeError);
          await db
            .update(carts)
            .set({
              paymentIntentId: null,
              clientSecret: null,
            })
            .where(eq(carts.id, cartId));
        }
      }
    }

    // Create a direct PaymentIntent (no Connect account needed!)
    console.log("Creating Stripe PaymentIntent with amount:", orderTotal);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: orderTotal,
      currency: currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
      description: `MapBuddi purchase - ${items.length} WanderList(s)`,
    });
    console.log("PaymentIntent created successfully:", paymentIntent.id);

    // save paymentIntent to cart in db
    await db
      .update(carts)
      .set({
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
      })
      .where(eq(carts.id, cartId));
    
    return { clientSecret: paymentIntent.client_secret };
  } catch (err) {
    console.error("Error creating payment intent:", err);
    throw new Error(`Failed to create payment intent: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

// Helper Functions
const calculateOrderAmounts = (items: CheckoutItem[]) => {
  const subtotal = items.reduce((acc, item) => {
    return acc + item.price * item.qty;
  }, 0);

  // Convert to cents for Stripe
  const orderTotal = Math.round(subtotal * 100);
  
  // Calculate what seller will receive after all fees
  const stripeFixedFee = 30; // $0.30 in cents
  const stripePercentFee = 0.029; // 2.9%
  const platformFeePercent = 0.10; // 10%
  
  const stripeFee = stripeFixedFee + Math.round(orderTotal * stripePercentFee);
  const platformFee = Math.round(orderTotal * platformFeePercent);
  const sellerReceives = orderTotal - stripeFee - platformFee;

  console.log("=== FEE BREAKDOWN ===");
  console.log("Order total:", orderTotal, "cents ($" + (orderTotal/100).toFixed(2) + ")");
  console.log("Stripe fee:", stripeFee, "cents ($" + (stripeFee/100).toFixed(2) + ")");
  console.log("Platform fee:", platformFee, "cents ($" + (platformFee/100).toFixed(2) + ")");
  console.log("Seller receives:", sellerReceives, "cents ($" + (sellerReceives/100).toFixed(2) + ")");

  return {
    orderTotal, // What buyer pays (in cents)
    platformFee, // What MapBuddi keeps (in cents)
    stripeFee, // What Stripe takes (in cents)
    sellerReceives, // What seller gets (in cents)
  };
};

export async function getPaymentIntents({
  startingAfterPaymentId,
  beforePaymentId,
}: {
  startingAfterPaymentId?: string;
  beforePaymentId?: string;
}) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-08-27.basil",
    });

    const storeId = Number(await getStoreId());

    if (isNaN(storeId)) throw Error("Invalid store id");

    const payment = await db
      .select({
        stripeAccountId: payments.stripeAccountId,
      })
      .from(payments)
      .where(eq(payments.storeId, storeId));

    if (!payment[0].stripeAccountId) throw Error("Stripe Account Id not found");

    const paymentIntentOptions = {
      limit: 5,
    } as {
      limit: number;
      starting_after?: string;
      ending_before?: string;
    };

    if (startingAfterPaymentId) {
      paymentIntentOptions["starting_after"] = startingAfterPaymentId;
    } else if (beforePaymentId) {
      paymentIntentOptions["ending_before"] = beforePaymentId;
    }

    const paymentIntents = await stripe.paymentIntents.list(
      paymentIntentOptions,
      {
        stripeAccount: payment[0].stripeAccountId,
      }
    );

    return {
      paymentIntents: paymentIntents.data.map((item) => ({
        id: item.id,
        amount: item.amount / 100,
        created: item.created,
        cartId: Number(item.metadata.cartId),
      })),
      hasMore: paymentIntents.has_more,
    };
    /*
    .filter(
      (item: StripePaymentIntent) =>
        !!item.metadata.cartId && item.status === "requires_payment_method"
    );
    */
  } catch (err) {
    console.log("error", err);
    return {
      paymentIntents: [],
      hasMore: false,
    };
  }
}

export async function getPaymentIntentDetails({
  paymentIntentId,
  storeSlug,
  deliveryPostalCode,
}: {
  paymentIntentId: string;
  storeSlug: string;
  deliveryPostalCode?: string;
}) {
  try {
    const cartId = cookies().get("cartId")?.value;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-08-27.basil",
    });

    // For direct payments, retrieve from main account (no Connect account needed)
    console.log("=== RETRIEVING PAYMENT INTENT ===");
    console.log("Payment Intent ID:", paymentIntentId);
    console.log("Cart ID from cookies:", cartId);

    const paymentDetails = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log("Payment Intent retrieved successfully");
    console.log("Payment status:", paymentDetails.status);
    console.log("Payment metadata cart ID:", paymentDetails.metadata.cartId);

    // For digital products, we don't need strict postal code verification
    // Just verify the cart ID matches or use the deliveryPostalCode override
    const isCartValid = paymentDetails.metadata.cartId === cartId;
    const isPostcodeOverride = deliveryPostalCode === "DIGITAL";
    
    if (!isCartValid && !isPostcodeOverride) {
      console.log("Cart validation failed - cart ID mismatch");
      throw Error("Invalid cart id - further verification needed");
    }

    console.log("Payment intent verification successful");
    return { paymentDetails, isVerified: true };
  } catch (err) {
    console.log("=== PAYMENT INTENT RETRIEVAL ERROR ===", err);
    return { paymentDetails: null, isVerified: false };
  }
}
