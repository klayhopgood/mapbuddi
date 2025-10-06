"use server";

import { db } from "@/db/db";
import { sellerPayoutMethods } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Verify PayPal email address by checking if it's a valid PayPal account
 * This is a simplified version - in production you'd use PayPal's API
 */
export async function verifyPayPalEmail(email: string): Promise<{
  isValid: boolean;
  isVerified: boolean;
  message: string;
}> {
  try {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        isVerified: false,
        message: "Invalid email format"
      };
    }

    // In a real implementation, you would:
    // 1. Use PayPal's API to check if the email is registered
    // 2. Check if the account is verified
    // 3. Check if it can receive business payments
    
    // For now, we'll do a basic check and warn the user
    // You could integrate with PayPal's verification API here
    
    return {
      isValid: true,
      isVerified: false, // We can't verify without PayPal API integration
      message: "Email format is valid. Verification will happen during first payout attempt."
    };
    
  } catch (error) {
    return {
      isValid: false,
      isVerified: false,
      message: "Failed to verify email address"
    };
  }
}

/**
 * Update PayPal verification status in database
 */
export async function updatePayPalVerificationStatus(
  storeId: number, 
  email: string, 
  isVerified: boolean
) {
  try {
    await db
      .update(sellerPayoutMethods)
      .set({ 
        paypalVerified: isVerified,
        updatedAt: new Date()
      })
      .where(eq(sellerPayoutMethods.storeId, storeId));
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update PayPal verification status:", error);
    return { success: false };
  }
}

/**
 * What happens when PayPal payout fails due to unverified account
 */
export function getPayPalFailureReasons() {
  return {
    UNVERIFIED_ACCOUNT: "PayPal account is not verified. Recipient needs to verify their account.",
    INVALID_EMAIL: "Email address is not associated with a PayPal account.",
    CANNOT_RECEIVE_PAYMENTS: "PayPal account cannot receive business payments.",
    ACCOUNT_RESTRICTED: "PayPal account is restricted or limited.",
    COUNTRY_NOT_SUPPORTED: "PayPal payouts not supported in recipient's country."
  };
}
