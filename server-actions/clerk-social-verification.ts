"use server";

import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";

type SocialProvider = 'google' | 'facebook' | 'tiktok';

export async function verifySocialAccount(provider: SocialProvider) {
  try {
    const user = await currentUser();
    if (!user || !user.privateMetadata.storeId) {
      throw new Error("User not authenticated");
    }

    // Check if user has this social connection
    const externalAccounts = user.externalAccounts || [];
    const socialConnection = externalAccounts.find(account => account.provider === provider);

    if (!socialConnection) {
      throw new Error(`No ${provider} account connected. Please connect your ${provider} account first.`);
    }

    // Get basic profile info from the connection
    let socialUrl = '';
    let username = '';

    switch (provider) {
      case 'google':
        // For YouTube, we'll use the Google account email/name
        username = socialConnection.emailAddress || user.emailAddresses[0]?.emailAddress || '';
        socialUrl = `https://www.youtube.com/@${username.split('@')[0]}`;
        break;
      case 'facebook':
        // For Instagram, we'll use the Facebook username if available
        username = socialConnection.username || '';
        socialUrl = username ? `https://www.instagram.com/${username}` : '';
        break;
      case 'tiktok':
        username = socialConnection.username || '';
        socialUrl = username ? `https://www.tiktok.com/@${username}` : '';
        break;
    }

    // Get current store data
    const storeData = await db
      .select()
      .from(stores)
      .where(eq(stores.id, Number(user.privateMetadata.storeId)))
      .then((res) => res[0]);

    if (!storeData) {
      throw new Error("Store not found");
    }

    // Update store with verified social data
    const currentSocialLinks = storeData.socialLinks 
      ? JSON.parse(storeData.socialLinks) 
      : {};
    const currentVerifiedSocials = storeData.verifiedSocials 
      ? JSON.parse(storeData.verifiedSocials) 
      : [];

    // Map provider names to our social platforms
    const platformMap: Record<SocialProvider, string> = {
      'google': 'youtube',
      'facebook': 'instagram', 
      'tiktok': 'tiktok'
    };

    const platformName = platformMap[provider];

    // Add the verified social account
    if (socialUrl) {
      currentSocialLinks[platformName] = socialUrl;
    }
    
    if (!currentVerifiedSocials.includes(platformName)) {
      currentVerifiedSocials.push(platformName);
    }

    await db
      .update(stores)
      .set({
        socialLinks: JSON.stringify(currentSocialLinks),
        verifiedSocials: JSON.stringify(currentVerifiedSocials),
      })
      .where(eq(stores.id, Number(user.privateMetadata.storeId)));

    return { 
      success: true, 
      message: `${platformName.charAt(0).toUpperCase() + platformName.slice(1)} account verified successfully!`,
      socialUrl 
    };

  } catch (error) {
    console.error(`Error verifying ${provider} account:`, error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : `Failed to verify ${provider} account` 
    };
  }
}

export async function removeSocialVerification(platform: 'youtube' | 'instagram' | 'tiktok') {
  try {
    const user = await currentUser();
    if (!user || !user.privateMetadata.storeId) {
      throw new Error("User not authenticated");
    }

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

    // Remove the platform
    delete currentSocialLinks[platform];
    const updatedVerifiedSocials = currentVerifiedSocials.filter((p: string) => p !== platform);

    await db
      .update(stores)
      .set({
        socialLinks: JSON.stringify(currentSocialLinks),
        verifiedSocials: JSON.stringify(updatedVerifiedSocials),
      })
      .where(eq(stores.id, Number(user.privateMetadata.storeId)));

    return { success: true, message: `${platform} verification removed successfully` };
  } catch (error) {
    console.error(`Error removing ${platform} verification:`, error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : `Failed to remove ${platform} verification` 
    };
  }
}

export async function getUserSocialConnections() {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const externalAccounts = user.externalAccounts || [];
    
    return {
      hasGoogle: externalAccounts.some(acc => acc.provider === 'google'),
      hasFacebook: externalAccounts.some(acc => acc.provider === 'facebook'),
      hasTikTok: externalAccounts.some(acc => acc.provider === 'tiktok'),
      connections: externalAccounts.map(acc => ({
        provider: acc.provider,
        emailAddress: acc.emailAddress,
        username: acc.username,
      }))
    };
  } catch (error) {
    console.error("Error getting social connections:", error);
    return {
      hasGoogle: false,
      hasFacebook: false, 
      hasTikTok: false,
      connections: []
    };
  }
}
