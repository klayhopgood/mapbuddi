import { db } from "@/db/db";
import { userMapsIntegration, purchasedListSync } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getListDataForSync, generateKML } from "@/lib/kml-generator";
import { refreshGoogleToken } from "@/server-actions/maps-integration";

export async function syncListToGoogleMaps(
  userId: string, 
  listId: number, 
  orderId: number
): Promise<{ success: boolean; message: string; mapId?: string }> {
  try {
    console.log(`=== STARTING SYNC FOR LIST ${listId} ===`);
    
    // Get user's Google integration
    const integration = await db
      .select()
      .from(userMapsIntegration)
      .where(eq(userMapsIntegration.userId, userId));

    if (!integration.length || !integration[0].googleMapsConnected) {
      return { success: false, message: "Google Maps not connected" };
    }

    let accessToken = integration[0].googleAccessToken;
    
    // Check if token needs refresh
    if (integration[0].googleTokenExpiry && new Date() > integration[0].googleTokenExpiry) {
      console.log("Token expired, refreshing...");
      try {
        accessToken = await refreshGoogleToken(userId);
      } catch (error) {
        return { success: false, message: "Failed to refresh Google token" };
      }
    }

    if (!accessToken) {
      return { success: false, message: "No valid access token" };
    }

    // Get list data
    console.log("Fetching list data...");
    const listData = await getListDataForSync(listId);
    if (!listData) {
      return { success: false, message: "List not found or has no POIs" };
    }

    console.log(`Found list: ${listData.name} with ${listData.pois.length} POIs`);

    // Generate KML
    console.log("Generating KML...");
    const kmlContent = generateKML(listData);
    
    // Create Google My Map via Drive API
    console.log("Creating Google My Map...");
    const mapResult = await createGoogleMyMap(accessToken, listData.name, kmlContent);
    
    if (!mapResult.success || !mapResult.mapId) {
      return { success: false, message: mapResult.message || "Failed to create Google My Map" };
    }

    // Update sync status in database
    console.log("Updating sync status in database...");
    await db
      .update(purchasedListSync)
      .set({
        googleMapsSynced: true,
        googleMapsMapId: mapResult.mapId,
        googleMapsLastSync: new Date(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(purchasedListSync.userId, userId),
        eq(purchasedListSync.listId, listId),
        eq(purchasedListSync.orderId, orderId)
      ));

    console.log(`=== SYNC COMPLETED FOR LIST ${listId} ===`);
    return { 
      success: true, 
      message: "Successfully synced to Google Maps",
      mapId: mapResult.mapId
    };

  } catch (error) {
    console.error("Sync error:", error);
    
    // Mark sync as failed in database
    try {
      await db
        .update(purchasedListSync)
        .set({
          googleMapsSynced: false,
          googleMapsSyncEnabled: false, // Turn off sync on failure
          updatedAt: new Date(),
        })
        .where(and(
          eq(purchasedListSync.userId, userId),
          eq(purchasedListSync.listId, listId),
          eq(purchasedListSync.orderId, orderId)
        ));
    } catch (dbError) {
      console.error("Failed to update sync failure status:", dbError);
    }

    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Unknown sync error" 
    };
  }
}

async function createGoogleMyMap(
  accessToken: string, 
  mapName: string, 
  kmlContent: string
): Promise<{ success: boolean; message?: string; mapId?: string }> {
  try {
    // Step 1: Create a new file in Google Drive
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${mapName} (MapBuddi)`,
        mimeType: 'application/vnd.google-apps.map', // Google My Maps MIME type
        parents: [], // Root folder
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.error("Failed to create Google My Map:", error);
      return { success: false, message: "Failed to create map file" };
    }

    const fileData = await createResponse.json();
    console.log("Created Google My Map with ID:", fileData.id);

    // Step 2: Upload KML content to the map
    const uploadResponse = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileData.id}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/vnd.google-earth.kml+xml',
        },
        body: kmlContent,
      }
    );

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.error("Failed to upload KML to Google My Map:", error);
      return { success: false, message: "Failed to upload map data" };
    }

    console.log("Successfully uploaded KML content to Google My Map");

    return { 
      success: true, 
      mapId: fileData.id,
      message: "Google My Map created successfully"
    };

  } catch (error) {
    console.error("Google My Map creation error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Unknown error creating map" 
    };
  }
}

export async function processAllPendingSyncs(): Promise<void> {
  try {
    console.log("=== PROCESSING ALL PENDING SYNCS ===");
    
    // Get all pending syncs
    const pendingSyncs = await db
      .select()
      .from(purchasedListSync)
      .where(and(
        eq(purchasedListSync.googleMapsSyncEnabled, true),
        eq(purchasedListSync.googleMapsSynced, false)
      ));

    console.log(`Found ${pendingSyncs.length} pending syncs`);

    for (const sync of pendingSyncs) {
      console.log(`Processing sync for user ${sync.userId}, list ${sync.listId}`);
      
      const result = await syncListToGoogleMaps(
        sync.userId, 
        sync.listId, 
        sync.orderId
      );
      
      if (result.success) {
        console.log(`✅ Sync completed for list ${sync.listId}`);
      } else {
        console.log(`❌ Sync failed for list ${sync.listId}: ${result.message}`);
      }
      
      // Add delay between syncs to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("=== FINISHED PROCESSING PENDING SYNCS ===");
  } catch (error) {
    console.error("Error processing pending syncs:", error);
  }
}
