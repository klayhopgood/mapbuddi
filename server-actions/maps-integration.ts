"use server";

import { db } from "@/db/db";
import { userMapsIntegration, purchasedListSync } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

export async function connectGoogleMaps(userId: string) {
  try {
    const user = await currentUser();
    if (!user || user.id !== userId) {
      return { success: false, message: "Unauthorized" };
    }

    // Generate Google OAuth URL
    const scopes = [
      'https://www.googleapis.com/auth/drive.file', // For creating My Maps
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(scopes.join(' '))}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=${userId}`;

    return { 
      success: true, 
      authUrl,
      message: "Redirecting to Google for authorization..."
    };
  } catch (error) {
    console.error("Google Maps connection error:", error);
    return { 
      success: false, 
      message: "Failed to initialize Google Maps connection" 
    };
  }
}

export async function handleGoogleCallback(code: string, state: string) {
  try {
    const userId = state;
    
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_REDIRECT_URI,
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      throw new Error("Failed to get access token");
    }

    // Store tokens in database
    const existingIntegration = await db
      .select()
      .from(userMapsIntegration)
      .where(eq(userMapsIntegration.userId, userId));

    const tokenExpiry = new Date(Date.now() + (tokens.expires_in * 1000));

    if (existingIntegration.length > 0) {
      await db
        .update(userMapsIntegration)
        .set({
          googleMapsConnected: true,
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleTokenExpiry: tokenExpiry,
          googleDriveConnected: true,
          updatedAt: new Date(),
        })
        .where(eq(userMapsIntegration.userId, userId));
    } else {
      await db
        .insert(userMapsIntegration)
        .values({
          userId,
          googleMapsConnected: true,
          googleAccessToken: tokens.access_token,
          googleRefreshToken: tokens.refresh_token,
          googleTokenExpiry: tokenExpiry,
          googleDriveConnected: true,
        });
    }

    return { success: true, message: "Google Maps connected successfully!" };
  } catch (error) {
    console.error("Google callback error:", error);
    return { success: false, message: "Failed to connect Google Maps" };
  }
}

export async function toggleListSync(
  userId: string, 
  listId: number, 
  orderId: number, 
  platform: 'google' | 'apple'
) {
  try {
    const user = await currentUser();
    if (!user || user.id !== userId) {
      return { success: false, message: "Unauthorized" };
    }

    // Check if user has maps integration
    const integration = await db
      .select()
      .from(userMapsIntegration)
      .where(eq(userMapsIntegration.userId, userId));

    if (!integration.length || !integration[0].googleMapsConnected) {
      return { success: false, message: "Google Maps not connected" };
    }

    // Get or create sync record
    const existingSync = await db
      .select()
      .from(purchasedListSync)
      .where(and(
        eq(purchasedListSync.userId, userId),
        eq(purchasedListSync.listId, listId),
        eq(purchasedListSync.orderId, orderId)
      ));

    const now = new Date();

           if (existingSync.length > 0) {
             // Toggle existing sync
             const currentStatus = existingSync[0].googleMapsSyncEnabled;
             
             if (!currentStatus) {
               // Enabling sync - trigger immediate sync
               await db
                 .update(purchasedListSync)
                 .set({
                   googleMapsSyncEnabled: true,
                   googleMapsSynced: false, // Reset sync status
                   updatedAt: now,
                 })
                 .where(eq(purchasedListSync.id, existingSync[0].id));

               // Trigger sync in background
               triggerBackgroundSync(userId, listId, orderId);
               
               return { success: true, message: "Sync enabled - processing..." };
             } else {
               // Disabling sync - delete the KML file from Google Drive
               const mapId = existingSync[0].googleMapsMapId;
               if (mapId) {
                 // Trigger cleanup in background
                 triggerBackgroundCleanup(userId, mapId);
               }

               await db
                 .update(purchasedListSync)
                 .set({
                   googleMapsSyncEnabled: false,
                   googleMapsSynced: false,
                   googleMapsMapId: null,
                   updatedAt: now,
                 })
                 .where(eq(purchasedListSync.id, existingSync[0].id));

               return { success: true, message: "Sync disabled - removing from Drive..." };
             }
    } else {
      // Create new sync record and enable
      await db
        .insert(purchasedListSync)
        .values({
          userId,
          orderId,
          listId,
          googleMapsSyncEnabled: true,
          googleMapsSynced: false,
        });

      // Trigger sync in background
      triggerBackgroundSync(userId, listId, orderId);

      return { success: true, message: "Sync enabled - processing..." };
    }
  } catch (error) {
    console.error("Toggle sync error:", error);
    return { success: false, message: "Failed to update sync status" };
  }
}

// Helper function to trigger sync without blocking the UI
async function triggerBackgroundSync(userId: string, listId: number, orderId: number) {
  try {
    // Call our sync API endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    fetch(`${baseUrl}/api/maps/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'sync_list',
        listId,
        orderId,
        userId, // Pass userId for internal API call
      }),
    }).catch(error => {
      console.error("Background sync trigger failed:", error);
    });
  } catch (error) {
    console.error("Failed to trigger background sync:", error);
  }
}

// Helper function to trigger cleanup without blocking the UI
async function triggerBackgroundCleanup(userId: string, mapId: string) {
  try {
    // Call our cleanup API endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    fetch(`${baseUrl}/api/maps/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'cleanup_file',
        mapId,
        userId,
      }),
    }).catch(error => {
      console.error("Background cleanup trigger failed:", error);
    });
  } catch (error) {
    console.error("Failed to trigger background cleanup:", error);
  }
}

export async function refreshGoogleToken(userId: string) {
  try {
    const integration = await db
      .select()
      .from(userMapsIntegration)
      .where(eq(userMapsIntegration.userId, userId));

    if (!integration.length || !integration[0].googleRefreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: integration[0].googleRefreshToken!,
        grant_type: 'refresh_token',
      }),
    });

    const tokens = await response.json();

    if (!tokens.access_token) {
      throw new Error("Failed to refresh token");
    }

    const tokenExpiry = new Date(Date.now() + (tokens.expires_in * 1000));

    await db
      .update(userMapsIntegration)
      .set({
        googleAccessToken: tokens.access_token,
        googleTokenExpiry: tokenExpiry,
        updatedAt: new Date(),
      })
      .where(eq(userMapsIntegration.userId, userId));

    return tokens.access_token;
  } catch (error) {
    console.error("Token refresh error:", error);
    throw error;
  }
}
