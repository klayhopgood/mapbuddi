"use server";

import Stripe from "stripe";
import { db } from "@/db/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function generateOnboardingLink(storeId: number) {
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
    console.log("Generating onboarding link for account:", accountId);

    // Create a fresh account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/selling/payments`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/selling/payments`,
      type: "account_onboarding",
    });

    console.log("Generated onboarding link:", accountLink.url);

    return {
      success: true,
      onboardingUrl: accountLink.url,
      accountId: accountId,
    };

  } catch (error) {
    console.error("Error generating onboarding link:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
