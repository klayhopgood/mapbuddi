"use server";

import { db } from "@/db/db";
import { sellerPayouts } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function markPayoutAsPaid(formData: FormData) {
  try {
    const storeId = Number(formData.get("storeId"));
    
    if (!storeId || isNaN(storeId)) {
      console.error("Invalid store ID");
      return;
    }

    // Get all pending payouts for this store
    const pendingPayouts = await db
      .select()
      .from(sellerPayouts)
      .where(
        and(
          eq(sellerPayouts.storeId, storeId),
          eq(sellerPayouts.status, "pending")
        )
      );

    if (pendingPayouts.length === 0) {
      console.error("No pending payouts found for this store");
      return;
    }

    // Mark all pending payouts as paid
    for (const payout of pendingPayouts) {
      await db
        .update(sellerPayouts)
        .set({
          status: "paid",
          payoutDate: new Date(),
          transactionId: `manual_${Date.now()}_${payout.id}`,
        })
        .where(eq(sellerPayouts.id, payout.id));
    }

    revalidatePath("/admin/payouts");
    console.log(`Marked ${pendingPayouts.length} payout(s) as paid for store ${storeId}`);
  } catch (error) {
    console.error("Error marking payout as paid:", error);
  }
}

export async function undoPayout(formData: FormData) {
  try {
    const storeId = Number(formData.get("storeId"));
    
    if (!storeId || isNaN(storeId)) {
      console.error("Invalid store ID");
      return;
    }

    // Get the most recent paid payout for this store
    const lastPaidPayout = await db
      .select()
      .from(sellerPayouts)
      .where(
        and(
          eq(sellerPayouts.storeId, storeId),
          eq(sellerPayouts.status, "paid")
        )
      )
      .orderBy(desc(sellerPayouts.payoutDate))
      .limit(1);

    if (lastPaidPayout.length === 0) {
      console.error("No paid payouts found to undo for this store");
      return;
    }

    const payout = lastPaidPayout[0];

    // Mark the payout as pending again
    await db
      .update(sellerPayouts)
      .set({
        status: "pending",
        payoutDate: null,
        transactionId: null,
      })
      .where(eq(sellerPayouts.id, payout.id));

    revalidatePath("/admin/payouts");
    console.log(`Undid payout ${payout.id} for store ${storeId}. Amount: $${payout.amount}`);
  } catch (error) {
    console.error("Error undoing payout:", error);
  }
}
