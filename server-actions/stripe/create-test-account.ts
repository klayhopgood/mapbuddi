"use server";

import Stripe from "stripe";
import { db } from "@/db/db";
import { payments } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createTestStripeAccount(storeId: number) {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-08-27.basil",
    });

    console.log("Creating new test Stripe account for store:", storeId);

    // Create a new Express account with minimal requirements
    const account = await stripe.accounts.create({
      type: "express",
      country: "US", // US accounts have fewer requirements for testing
      email: "test@mapbuddi.com",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual", // Individual accounts have fewer requirements
      individual: {
        first_name: "Test",
        last_name: "Seller",
        email: "test@mapbuddi.com",
        phone: "+1234567890",
        dob: {
          day: 1,
          month: 1,
          year: 1990,
        },
        address: {
          line1: "123 Test St",
          city: "Test City",
          state: "CA",
          postal_code: "12345",
          country: "US",
        },
      },
      business_profile: {
        mcc: "5734", // Computer software stores
        url: "https://mapbuddi.com",
      },
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: "127.0.0.1", // Test IP
      },
    });

    console.log("Created account:", account.id);

    // Update the database with the new account ID
    await db
      .update(payments)
      .set({ stripeAccountId: account.id })
      .where(eq(payments.storeId, storeId));

    console.log("Updated database with new account ID");

    // Check the account status
    const updatedAccount = await stripe.accounts.retrieve(account.id);

    return {
      success: true,
      accountId: account.id,
      capabilities: updatedAccount.capabilities,
      requirements: updatedAccount.requirements,
    };

  } catch (error) {
    console.error("Error creating test account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
