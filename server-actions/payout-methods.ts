"use server";

import { db } from "@/db/db";
import { sellerPayoutMethods } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function savePayoutMethods(data: {
  storeId: number;
  preferredMethod: string;
  paypalEmail?: string;
  usRoutingNumber?: string;
  usAccountNumber?: string;
  usAccountType?: string;
  ukSortCode?: string;
  ukAccountNumber?: string;
  euIban?: string;
  euBic?: string;
  auBsb?: string;
  auAccountNumber?: string;
  accountHolderName?: string;
  accountHolderAddress?: string;
}) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("User not authenticated");

    // Validate the data based on preferred method
    if (data.preferredMethod === "paypal" && !data.paypalEmail) {
      throw new Error("PayPal email is required");
    }

    if (data.preferredMethod === "bank_us" && (!data.usRoutingNumber || !data.usAccountNumber || !data.accountHolderName)) {
      throw new Error("US banking details are incomplete");
    }

    if (data.preferredMethod === "bank_uk" && (!data.ukSortCode || !data.ukAccountNumber || !data.accountHolderName)) {
      throw new Error("UK banking details are incomplete");
    }

    if (data.preferredMethod === "bank_eu" && (!data.euIban || !data.accountHolderName)) {
      throw new Error("EU banking details are incomplete");
    }

    if (data.preferredMethod === "bank_au" && (!data.auBsb || !data.auAccountNumber || !data.accountHolderName)) {
      throw new Error("AU banking details are incomplete");
    }

    // Check if payout methods already exist
    const existing = await db
      .select()
      .from(sellerPayoutMethods)
      .where(eq(sellerPayoutMethods.storeId, data.storeId));

    const payoutData = {
      storeId: data.storeId,
      sellerId: user.id,
      paypalEmail: data.paypalEmail,
      usRoutingNumber: data.usRoutingNumber,
      usAccountNumber: data.usAccountNumber,
      usAccountType: data.usAccountType,
      ukSortCode: data.ukSortCode,
      ukAccountNumber: data.ukAccountNumber,
      euIban: data.euIban,
      euBic: data.euBic,
      auBsb: data.auBsb,
      auAccountNumber: data.auAccountNumber,
      accountHolderName: data.accountHolderName,
      accountHolderAddress: data.accountHolderAddress,
      preferredMethod: data.preferredMethod,
      updatedAt: new Date(),
    };

    if (existing.length > 0) {
      // Update existing
      await db
        .update(sellerPayoutMethods)
        .set(payoutData)
        .where(eq(sellerPayoutMethods.storeId, data.storeId));
    } else {
      // Create new
      await db.insert(sellerPayoutMethods).values(payoutData);
    }

    return {
      success: true,
      message: "Payout methods saved successfully",
    };

  } catch (error) {
    console.error("Error saving payout methods:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to save payout methods",
    };
  }
}

export async function getPayoutMethods(storeId: number) {
  try {
    const methods = await db
      .select()
      .from(sellerPayoutMethods)
      .where(eq(sellerPayoutMethods.storeId, storeId));

    return methods.length > 0 ? methods[0] : null;
  } catch (error) {
    console.error("Error fetching payout methods:", error);
    return null;
  }
}
