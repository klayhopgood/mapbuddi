"use server";

import Stripe from "stripe";
import { db } from "@/db/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function checkAndFixStripeCapabilities(storeId: number) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-08-27.basil",
    });

    // Get the Stripe account ID
    const payment = await db
      .select({ stripeAccountId: payments.stripeAccountId })
      .from(payments)
      .where(eq(payments.storeId, storeId));

    if (!payment.length || !payment[0].stripeAccountId) {
      throw new Error("No Stripe account found for store");
    }

    const accountId = payment[0].stripeAccountId;
    console.log("Checking capabilities for account:", accountId);

    // Retrieve the account and check capabilities
    const account = await stripe.accounts.retrieve(accountId);
    console.log("Current capabilities:", account.capabilities);

    // Check if card_payments capability is missing or restricted
    if (account.capabilities?.card_payments !== "active") {
      console.log("Card payments capability not active, requesting...");
      
      // Request the card_payments capability
      await stripe.accounts.update(accountId, {
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      console.log("Capabilities requested successfully");
    }

    // Return the updated account info
    const updatedAccount = await stripe.accounts.retrieve(accountId);
    return {
      success: true,
      capabilities: updatedAccount.capabilities,
      requirements: updatedAccount.requirements,
    };

  } catch (error) {
    console.error("Error checking/fixing capabilities:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
