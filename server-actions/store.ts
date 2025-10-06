"use server";

import { db } from "@/db/db";
import { stores } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { createSlug } from "@/lib/createSlug";

export async function createStore(storeName: string) {
  try {
    const user = await currentUser();
    if (!user) {
      const res = {
        error: true,
        message: "Unauthenticated",
        action: "User is not authenticated",
      };
      return res;
    }

    const existingStore = await db
      .select()
      .from(stores)
      .where(
        or(eq(stores.name, storeName), eq(stores.slug, createSlug(storeName)))
      );

    if (existingStore.length > 0) {
      const res = {
        error: true,
        message: "Sorry, a store with that name already exists.",
        action: "Please try again.",
      };
      return res;
    }

    const [{ id: storeId }] = await db.insert(stores).values({
      name: storeName,
      slug: createSlug(storeName),
      userId: user.id, // ✅ Fix: Set the user_id when creating store
    }).returning();

    if (user?.privateMetadata.storeId) {
      const res = {
        error: false,
        message: "Store already exists",
        action: "You already have a store",
      };

      return res;
    }

    const client = await clerkClient();
    await client.users.updateUser(user.id, {
      privateMetadata: { ...user.privateMetadata, storeId },
    });

    const res = {
      error: false,
      message: "Store created",
      action: "Success, your store has been created",
    };

    return res;
  } catch (err) {
    console.log(err);
    const res = {
      error: true,
      message: "Sorry, an error occured creating your store. ",
      action: "Please try again.",
    };
    return res;
  }
}

export async function updateStore(args: {
  name: string | null;
  description: string | null;
  industry: string | null;
}) {
  const inputSchema = z.object({
    name: z.string().nullable(),
    description: z.string().nullable(),
    industry: z.string().nullable(),
  });

  try {
    const user = await currentUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Validate input
    const validatedArgs = inputSchema.parse(args);
    
    // Filter out null values for the update
    const updateData: any = {};
    if (validatedArgs.name !== null) updateData.name = validatedArgs.name;
    if (validatedArgs.description !== null) updateData.description = validatedArgs.description;
    if (validatedArgs.industry !== null) updateData.industry = validatedArgs.industry;

    await db
      .update(stores)
      .set(updateData)
      .where(eq(stores.id, Number(user?.privateMetadata.storeId)));

    const res = {
      error: false,
      message: "Store details updated",
      action: "Success, your store's details have been updated",
    };

    return res;
  } catch (err) {
    console.error("Error updating store:", err);
    const res = {
      error: true,
      message: "Sorry, an error occurred updating your details.",
      action: "Please try again.",
    };
    return res;
  }
}
