"use server";

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db/db";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/account/selling/profile?error=oauth_cancelled`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(`/account/selling/profile?error=oauth_failed`, request.url)
      );
    }

    const user = await currentUser();
    if (!user || !user.privateMetadata.storeId) {
      return NextResponse.redirect(
        new URL(`/account/selling/profile?error=unauthorized`, request.url)
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://graph.facebook.com/v18.0/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.META_CLIENT_ID!,
        client_secret: process.env.META_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/meta/verify/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Meta token exchange failed:", tokenData);
      return NextResponse.redirect(
        new URL(`/account/selling/profile?error=token_failed`, request.url)
      );
    }

    // Get Instagram business account info
    const accountResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?fields=instagram_business_account{id,name,username,followers_count,profile_picture_url}&access_token=${tokenData.access_token}`
    );

    const accountData = await accountResponse.json();

    if (!accountResponse.ok) {
      console.error("Instagram account fetch failed:", accountData);
      return NextResponse.redirect(
        new URL(`/account/selling/profile?error=instagram_fetch_failed`, request.url)
      );
    }

    // Find Instagram business account
    let instagramAccount = null;
    for (const page of accountData.data || []) {
      if (page.instagram_business_account) {
        instagramAccount = page.instagram_business_account;
        break;
      }
    }

    if (!instagramAccount) {
      return NextResponse.redirect(
        new URL(`/account/selling/profile?error=no_instagram_business`, request.url)
      );
    }

    const instagramUrl = `https://www.instagram.com/${instagramAccount.username}`;

    // Get current store data
    const storeData = await db
      .select()
      .from(stores)
      .where(eq(stores.id, Number(user.privateMetadata.storeId)))
      .then((res) => res[0]);

    if (!storeData) {
      return NextResponse.redirect(
        new URL(`/account/selling/profile?error=store_not_found`, request.url)
      );
    }

    // Update store with verified Instagram data
    const currentSocialLinks = storeData.socialLinks 
      ? JSON.parse(storeData.socialLinks) 
      : {};
    const currentVerifiedSocials = storeData.verifiedSocials 
      ? JSON.parse(storeData.verifiedSocials) 
      : [];
    const currentSocialData = storeData.socialData 
      ? JSON.parse(storeData.socialData) 
      : {};

    // Add Instagram data
    currentSocialLinks.instagram = instagramUrl;
    if (!currentVerifiedSocials.includes("instagram")) {
      currentVerifiedSocials.push("instagram");
    }
    currentSocialData.instagram = {
      accountId: instagramAccount.id,
      username: instagramAccount.username,
      name: instagramAccount.name,
      followersCount: instagramAccount.followers_count || 0,
      profilePictureUrl: instagramAccount.profile_picture_url,
      verifiedAt: new Date().toISOString(),
    };

    await db
      .update(stores)
      .set({
        socialLinks: JSON.stringify(currentSocialLinks),
        verifiedSocials: JSON.stringify(currentVerifiedSocials),
        socialData: JSON.stringify(currentSocialData),
      })
      .where(eq(stores.id, Number(user.privateMetadata.storeId)));

    return NextResponse.redirect(
      new URL(`/account/selling/profile?success=instagram_verified`, request.url)
    );
  } catch (error) {
    console.error("Meta OAuth verification error:", error);
    return NextResponse.redirect(
      new URL(`/account/selling/profile?error=verification_failed`, request.url)
    );
  }
}
