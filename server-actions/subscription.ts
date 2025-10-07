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

    // Update or create subscription record with customer ID
    if (existingSubscription) {
      await db
        .update(subscriptions)
        .set({
          stripeCustomerId: customerId,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.id, existingSubscription.id));
    } else {
      await db
        .insert(subscriptions)
        .values({
          storeId,
          stripeCustomerId: customerId,
          status: "pending",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
    }

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
  try {
    console.log(`=== PROCESSING WEBHOOK: ${event.type} ===`);
    console.log(`Event data:`, JSON.stringify(event.data.object, null, 2));
    
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session:", JSON.stringify(session, null, 2));
        
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const storeId = parseInt(session.metadata?.storeId || "0");

        console.log(`Session data: subscriptionId=${subscriptionId}, customerId=${customerId}, storeId=${storeId}`);

        if (!subscriptionId || !customerId || !storeId) {
          console.error("Missing data in checkout.session.completed event", {
            subscriptionId,
            customerId,
            storeId
          });
          return;
        }

        // Get the subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        console.log("Retrieved subscription:", JSON.stringify(subscription, null, 2));

        // Update or insert subscription record
        await db.insert(subscriptions).values({
          storeId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0]?.price.id,
          status: subscription.status,
          currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
        }).onConflictDoUpdate({
          target: subscriptions.storeId,
          set: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0]?.price.id,
            status: subscription.status,
            currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
            currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
            cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
            updatedAt: new Date(),
          },
        });

        console.log(`Subscription record updated for store ${storeId}`);

        // Activate all draft lists if subscription is active
        if (subscription.status === "active") {
          await activateAllDraftLists(storeId);
          console.log(`Activated all draft lists for store ${storeId}`);
        }
        break;
      }
      
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const storeId = parseInt(subscription.metadata.storeId || "0");
        
        console.log(`Processing ${event.type} for storeId: ${storeId}, status: ${subscription.status}`);
        console.log(`Subscription metadata:`, subscription.metadata);
        
        if (!storeId) {
          console.error("No storeId in subscription metadata", subscription.metadata);
          return;
        }

        // For subscription.created, we need to INSERT or UPDATE (upsert)
        // For subscription.updated, we UPDATE
        if (event.type === "customer.subscription.created") {
          console.log(`=== CREATING SUBSCRIPTION RECORD ===`);
          console.log(`Subscription data from Stripe:`, {
            id: subscription.id,
            customer: subscription.customer,
            status: subscription.status,
            current_period_start: (subscription as any).current_period_start,
            current_period_end: (subscription as any).current_period_end,
            cancel_at_period_end: (subscription as any).cancel_at_period_end,
            price_id: subscription.items.data[0]?.price.id
          });
          
          // Try to update existing record first, then insert if none exists
          const updateResult = await db
            .update(subscriptions)
            .set({
              stripeCustomerId: subscription.customer as string,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0]?.price.id,
              status: subscription.status,
              currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
              cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.storeId, storeId))
            .returning();

          console.log(`Update result:`, updateResult);
          console.log(`Updated ${updateResult.length} records`);

          // If no record was updated, insert a new one
          if (updateResult.length === 0) {
            console.log(`No existing record found, inserting new subscription record`);
            const insertResult = await db.insert(subscriptions).values({
              storeId,
              stripeCustomerId: subscription.customer as string,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0]?.price.id,
              status: subscription.status,
              currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
              cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
            }).returning();
            console.log(`Insert result:`, insertResult);
          } else {
            console.log(`Updated existing subscription record successfully`);
            console.log(`Final subscription record:`, updateResult[0]);
          }
        } else {
          console.log(`=== UPDATING SUBSCRIPTION RECORD ===`);
          const updateResult = await db
            .update(subscriptions)
            .set({
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0]?.price.id,
              status: subscription.status,
              currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
              cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.storeId, storeId))
            .returning();
          console.log(`Update result:`, updateResult);
        }

        console.log(`Subscription record processed for store ${storeId}`);

        // If subscription is active, activate all draft lists
        if (subscription.status === "active") {
          await activateAllDraftLists(storeId);
          console.log(`Activated all draft lists for store ${storeId}`);
        } else {
          await deactivateAllActiveLists(storeId);
          console.log(`Deactivated all active lists for store ${storeId}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const storeId = parseInt(subscription.metadata.storeId || "0");
        
        if (!storeId) {
          console.error("No storeId in subscription metadata");
          return;
        }

        await db
          .update(subscriptions)
          .set({
            status: "canceled",
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.storeId, storeId));

        // Deactivate all active lists (make them drafts)
        await deactivateAllActiveLists(storeId);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if ((invoice as any).subscription) {
          const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
          const storeId = parseInt(subscription.metadata.storeId || "0");
          
          if (storeId) {
            await db
              .update(subscriptions)
              .set({
                status: "past_due",
                updatedAt: new Date(),
              })
              .where(eq(subscriptions.storeId, storeId));

            // Optionally deactivate lists for past due subscriptions
            await deactivateAllActiveLists(storeId);
          }
        }
        break;
      }
    }
  } catch (error) {
    console.error("Error handling subscription webhook:", error);
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
