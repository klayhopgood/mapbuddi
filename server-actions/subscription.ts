"use server";

import { db } from "@/db/db";
import { subscriptions, stores, locationLists } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

const STRIPE_PRICE_ID = "price_1SFTH4BfpP8VYbV6Sk7Y2Jui";
const STRIPE_PRODUCT_ID = "prod_TBqzJQuZY7HuBP";

export async function getSubscriptionStatus(storeId: number) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get the subscription from database
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.storeId, storeId))
      .limit(1);

    if (!subscription) {
      return {
        isActive: false,
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      };
    }

    // Check if subscription is active
    const isActive = subscription.status === "active" && 
                    subscription.currentPeriodEnd && 
                    new Date(subscription.currentPeriodEnd) > new Date();

    return {
      isActive,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      currentPeriodEnd: subscription.currentPeriodEnd?.toISOString(),
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
    };
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return {
      isActive: false,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    };
  }
}

export async function createSubscription(storeId: number) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get store details
    const [store] = await db
      .select()
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    if (!store) {
      return { error: "Store not found" };
    }

    // Check if subscription already exists
    const [existingSubscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.storeId, storeId))
      .limit(1);

    if (existingSubscription && existingSubscription.status === "active") {
      return { error: "You already have an active subscription" };
    }

    // Create or get Stripe customer
    let customerId = existingSubscription?.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0]?.emailAddress,
        name: `${user.firstName} ${user.lastName}`.trim(),
        metadata: {
          userId: user.id,
          storeId: storeId.toString(),
        },
      });
      customerId = customer.id;
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/selling/membership?canceled=true`,
      metadata: {
        storeId: storeId.toString(),
        userId: user.id,
      },
      subscription_data: {
        metadata: {
          storeId: storeId.toString(),
          userId: user.id,
        },
      },
    });

    // Don't create any database record here - let webhooks handle everything
    // This prevents orphaned pending records and race conditions

    return { url: session.url };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return { error: "Failed to create subscription. Please try again." };
  }
}

export async function cancelSubscription(storeId: number) {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Get subscription
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.storeId, storeId))
      .limit(1);

    if (!subscription || !subscription.stripeSubscriptionId) {
      return { error: "No active subscription found" };
    }

    // Cancel subscription at period end in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    // Update local database
    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));

    return { success: true };
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return { error: "Failed to cancel subscription. Please try again." };
  }
}

export async function handleSubscriptionWebhook(event: Stripe.Event) {
  console.log(`Processing webhook: ${event.type}`);
  
  if (event.type === "customer.subscription.created") {
    const subscription = event.data.object as any;
    const storeId = parseInt(subscription.metadata?.storeId || "0");
    
    if (!storeId) {
      console.error("No storeId in metadata");
      return;
    }

    console.log(`Subscription periods: start=${subscription.current_period_start}, end=${subscription.current_period_end}`);
    
    await db.insert(subscriptions).values({
      storeId: storeId,
      stripeCustomerId: subscription.customer,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0]?.price?.id || null,
      status: subscription.status,
      currentPeriodStart: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
      currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    });

    console.log(`Created subscription for store ${storeId}`);
  }
}

async function activateAllDraftLists(storeId: number) {
  try {
    await db
      .update(locationLists)
      .set({
        isActive: true,
        updatedAt: new Date(),
      })
      .where(and(
        eq(locationLists.storeId, storeId),
        eq(locationLists.isActive, false)
      ));
  } catch (error) {
    console.error("Error activating draft lists:", error);
  }
}

async function deactivateAllActiveLists(storeId: number) {
  try {
    await db
      .update(locationLists)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(and(
        eq(locationLists.storeId, storeId),
        eq(locationLists.isActive, true)
      ));
  } catch (error) {
    console.error("Error deactivating active lists:", error);
  }
}

export async function checkSubscriptionForListActivation(storeId: number): Promise<boolean> {
  try {
    console.log(`Checking subscription for store ID: ${storeId}`);
    
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.storeId, storeId))
      .limit(1);

    console.log(`Subscription found:`, subscription);
    
    if (!subscription) {
      console.log(`No subscription found for store ${storeId}`);
      return false;
    }

    const isActive = subscription.status === 'active';
    console.log(`Subscription status: ${subscription.status}, isActive: ${isActive}`);
    
    return isActive;
  } catch (error) {
    console.error("Error checking subscription for list activation:", error);
    return false;
  }
}
