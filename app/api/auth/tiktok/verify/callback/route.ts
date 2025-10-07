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
    const tokenResponse = await fetch("https://open-api.tiktok.com/oauth/access_token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_ID!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/tiktok/verify/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || tokenData.error) {
      console.error("TikTok token exchange failed:", tokenData);
      return NextResponse.redirect(
        new URL(`/account/selling/profile?error=token_failed`, request.url)
      );
    }

    // Get TikTok user info
    const userResponse = await fetch(
      "https://open-api.tiktok.com/user/info/?fields=open_id,union_id,avatar_url,display_name,username,follower_count,following_count,likes_count,video_count",
      {
        headers: {
          Authorization: `Bearer ${tokenData.data.access_token}`,
        },
      }
    );

    const userData = await userResponse.json();

    if (!userResponse.ok || userData.error) {
      console.error("TikTok user fetch failed:", userData);
      return NextResponse.redirect(
        new URL(`/account/selling/profile?error=tiktok_fetch_failed`, request.url)
      );
    }

    const tiktokUrl = `https://www.tiktok.com/@${userData.data.user.username}`;

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

    // Update store with verified TikTok data
    const currentSocialLinks = storeData.socialLinks 
      ? JSON.parse(storeData.socialLinks) 
      : {};
    const currentVerifiedSocials = storeData.verifiedSocials 
      ? JSON.parse(storeData.verifiedSocials) 
      : [];
    const currentSocialData = storeData.socialData 
      ? JSON.parse(storeData.socialData) 
      : {};

    // Add TikTok data
    currentSocialLinks.tiktok = tiktokUrl;
    if (!currentVerifiedSocials.includes("tiktok")) {
      currentVerifiedSocials.push("tiktok");
    }
    currentSocialData.tiktok = {
      openId: userData.data.user.open_id,
      username: userData.data.user.username,
      displayName: userData.data.user.display_name,
      followerCount: userData.data.user.follower_count || 0,
      avatarUrl: userData.data.user.avatar_url,
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
      new URL(`/account/selling/profile?success=tiktok_verified`, request.url)
    );
  } catch (error) {
    console.error("TikTok OAuth verification error:", error);
    return NextResponse.redirect(
      new URL(`/account/selling/profile?error=verification_failed`, request.url)
    );
  }
}
