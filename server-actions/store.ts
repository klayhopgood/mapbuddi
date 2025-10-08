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
  storeId?: number;
  name?: string | null;
  description?: string | null;
  industry?: string | null; // Keep for backward compatibility
  firstName?: string | null;
  lastName?: string | null;
  age?: number | null;
  nationality?: string | null; // JSON string
  socialLinks?: string | null; // JSON string
  website?: string | null;
  verifiedSocials?: string | null; // JSON string
  profileImage?: string | null;
}) {
  const inputSchema = z.object({
    storeId: z.number().optional(),
    name: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    industry: z.string().nullable().optional(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    age: z.number().nullable().optional(),
    nationality: z.string().nullable().optional(),
    socialLinks: z.string().nullable().optional(),
    website: z.string().nullable().optional(),
    verifiedSocials: z.string().nullable().optional(),
    profileImage: z.string().nullable().optional(),
  });

  try {
    const user = await currentUser();
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    // Validate input
    const validatedArgs = inputSchema.parse(args);
    
    // Filter out null/undefined values for the update
    const updateData: any = {};
    if (validatedArgs.name !== null && validatedArgs.name !== undefined) updateData.name = validatedArgs.name;
    if (validatedArgs.description !== null && validatedArgs.description !== undefined) updateData.description = validatedArgs.description;
    if (validatedArgs.industry !== null && validatedArgs.industry !== undefined) updateData.industry = validatedArgs.industry;
    if (validatedArgs.firstName !== null && validatedArgs.firstName !== undefined) updateData.firstName = validatedArgs.firstName;
    if (validatedArgs.lastName !== null && validatedArgs.lastName !== undefined) updateData.lastName = validatedArgs.lastName;
    if (validatedArgs.age !== null && validatedArgs.age !== undefined) updateData.age = validatedArgs.age;
    if (validatedArgs.nationality !== null && validatedArgs.nationality !== undefined) updateData.nationality = validatedArgs.nationality;
    if (validatedArgs.socialLinks !== null && validatedArgs.socialLinks !== undefined) updateData.socialLinks = validatedArgs.socialLinks;
    if (validatedArgs.website !== null && validatedArgs.website !== undefined) updateData.website = validatedArgs.website;
    if (validatedArgs.verifiedSocials !== null && validatedArgs.verifiedSocials !== undefined) updateData.verifiedSocials = validatedArgs.verifiedSocials;
    if (validatedArgs.profileImage !== null && validatedArgs.profileImage !== undefined) updateData.profileImage = validatedArgs.profileImage;

    const storeId = validatedArgs.storeId || Number(user?.privateMetadata.storeId);
    
    await db
      .update(stores)
      .set(updateData)
      .where(eq(stores.id, storeId));

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
