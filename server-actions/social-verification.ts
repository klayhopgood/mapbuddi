"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function initiateYouTubeVerification() {
  const user = await currentUser();
  if (!user || !user.privateMetadata.storeId) {
    throw new Error("User not authenticated");
  }

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/verify/callback`,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    access_type: "offline",
    state: user.id, // Optional: can be used for additional security
  });

  const authUrl = `https://accounts.google.com/oauth/authorize?${params.toString()}`;
  redirect(authUrl);
}

export async function initiateInstagramVerification() {
  const user = await currentUser();
  if (!user || !user.privateMetadata.storeId) {
    throw new Error("User not authenticated");
  }

  const params = new URLSearchParams({
    client_id: process.env.META_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/meta/verify/callback`,
    response_type: "code",
    scope: "instagram_basic,pages_read_engagement,pages_show_list",
    state: user.id,
  });

  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  redirect(authUrl);
}

export async function initiateTikTokVerification() {
  const user = await currentUser();
  if (!user || !user.privateMetadata.storeId) {
    throw new Error("User not authenticated");
  }

  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/tiktok/verify/callback`,
    response_type: "code",
    scope: "user.info.basic,user.info.stats",
    state: user.id,
  });

  const authUrl = `https://www.tiktok.com/auth/authorize/?${params.toString()}`;
  redirect(authUrl);
}

export async function removeVerification(platform: "youtube" | "instagram" | "tiktok") {
  const user = await currentUser();
  if (!user || !user.privateMetadata.storeId) {
    throw new Error("User not authenticated");
  }

  const { db } = await import("@/db/db");
  const { stores } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");

  // Get current store data
  const storeData = await db
    .select()
    .from(stores)
    .where(eq(stores.id, Number(user.privateMetadata.storeId)))
    .then((res) => res[0]);

  if (!storeData) {
    throw new Error("Store not found");
  }

  // Remove platform from verified socials and social data
  const currentSocialLinks = storeData.socialLinks 
    ? JSON.parse(storeData.socialLinks) 
    : {};
  const currentVerifiedSocials = storeData.verifiedSocials 
    ? JSON.parse(storeData.verifiedSocials) 
    : [];
  const currentSocialData = storeData.socialData 
    ? JSON.parse(storeData.socialData) 
    : {};

  // Remove the platform
  delete currentSocialLinks[platform];
  const updatedVerifiedSocials = currentVerifiedSocials.filter((p: string) => p !== platform);
  delete currentSocialData[platform];

  await db
    .update(stores)
    .set({
      socialLinks: JSON.stringify(currentSocialLinks),
      verifiedSocials: JSON.stringify(updatedVerifiedSocials),
      socialData: JSON.stringify(currentSocialData),
    })
    .where(eq(stores.id, Number(user.privateMetadata.storeId)));

  return { success: true };
}
