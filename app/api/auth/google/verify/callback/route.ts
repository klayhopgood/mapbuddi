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
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/verify/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Google token exchange failed:", tokenData);
      return NextResponse.redirect(
        new URL(`/account/selling/profile?error=token_failed`, request.url)
      );
    }

    // Get YouTube channel info
    const channelResponse = await fetch(
      "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const channelData = await channelResponse.json();

    if (!channelResponse.ok || !channelData.items?.length) {
      console.error("YouTube channel fetch failed:", channelData);
      return NextResponse.redirect(
        new URL(`/account/selling/profile?error=no_youtube_channel`, request.url)
      );
    }

    const channel = channelData.items[0];
    const channelUrl = `https://www.youtube.com/@${channel.snippet.customUrl || channel.id}`;

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

    // Update store with verified YouTube data
    const currentSocialLinks = storeData.socialLinks 
      ? JSON.parse(storeData.socialLinks) 
      : {};
    const currentVerifiedSocials = storeData.verifiedSocials 
      ? JSON.parse(storeData.verifiedSocials) 
      : [];
    const currentSocialData = storeData.socialData 
      ? JSON.parse(storeData.socialData) 
      : {};

    // Add YouTube data
    currentSocialLinks.youtube = channelUrl;
    if (!currentVerifiedSocials.includes("youtube")) {
      currentVerifiedSocials.push("youtube");
    }
    currentSocialData.youtube = {
      channelId: channel.id,
      channelName: channel.snippet.title,
      customUrl: channel.snippet.customUrl,
      subscriberCount: parseInt(channel.statistics.subscriberCount || "0"),
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
      new URL(`/account/selling/profile?success=youtube_verified`, request.url)
    );
  } catch (error) {
    console.error("Google OAuth verification error:", error);
    return NextResponse.redirect(
      new URL(`/account/selling/profile?error=verification_failed`, request.url)
    );
  }
}
