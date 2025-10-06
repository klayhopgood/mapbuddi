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
    console.log("=== CREATING GOOGLE KML FILE ===");
    console.log("Map name:", mapName);
    console.log("Access token exists:", !!accessToken);
    console.log("KML content length:", kmlContent.length);

    // Google My Maps doesn't have a direct API, so let's create a KML file in Google Drive
    // The user can then import this KML into Google My Maps manually or we can provide instructions
    
    const createPayload = {
      name: `${mapName} (MapBuddi).kml`,
      parents: [], // Root folder
    };
    
    console.log("Creating KML file with payload:", createPayload);
    
    // Step 1: Create metadata for the file
    const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPayload),
    });

    console.log("Create response status:", createResponse.status);
    console.log("Create response headers:", Object.fromEntries(createResponse.headers.entries()));

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error("Failed to create KML file:", errorText);
      
      // Try to parse error details
      try {
        const errorJson = JSON.parse(errorText);
        console.error("Parsed error:", errorJson);
        return { 
          success: false, 
          message: `Google Drive API error: ${errorJson.error?.message || errorText}` 
        };
      } catch {
        return { 
          success: false, 
          message: `Failed to create KML file. Status: ${createResponse.status}. Response: ${errorText}` 
        };
      }
    }

    const fileData = await createResponse.json();
    console.log("Created KML file with ID:", fileData.id);
    console.log("File data:", fileData);

    // Step 2: Upload the KML content
    console.log("Uploading KML content...");
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

    console.log("Upload response status:", uploadResponse.status);

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Failed to upload KML content:", errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error("Parsed upload error:", errorJson);
        return { 
          success: false, 
          message: `KML upload error: ${errorJson.error?.message || errorText}` 
        };
      } catch {
        return { 
          success: false, 
          message: `Failed to upload KML content. Status: ${uploadResponse.status}. Response: ${errorText}` 
        };
      }
    }

    console.log("Successfully uploaded KML content");

    // Step 3: Make the file shareable so user can access it
    try {
      const shareResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            role: 'reader',
            type: 'user',
            emailAddress: 'me', // Share with the authenticated user
          }),
        }
      );

      if (shareResponse.ok) {
        console.log("File shared successfully");
      } else {
        console.log("File sharing failed, but KML created successfully");
      }
    } catch (shareError) {
      console.log("File sharing error (non-critical):", shareError);
    }

    return { 
      success: true, 
      mapId: fileData.id,
      message: "KML file created successfully in Google Drive. User can import this into Google My Maps."
    };

  } catch (error) {
    console.error("Google KML creation error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Unknown error creating KML file" 
    };
  }
}

export async function verifyKmlFileExists(
  userId: string, 
  mapId: string
): Promise<{ exists: boolean; message?: string }> {
  try {
    console.log("=== VERIFYING KML FILE EXISTS ===");
    console.log("User ID:", userId);
    console.log("Map ID:", mapId);

    // Get user's Google tokens
    const integration = await db
      .select()
      .from(userMapsIntegration)
      .where(eq(userMapsIntegration.userId, userId));

    if (!integration.length || !integration[0].googleMapsConnected) {
      return { exists: false, message: "Google Maps not connected" };
    }

    let accessToken = integration[0].googleAccessToken;

    // Check if token needs refresh
    if (integration[0].googleTokenExpiry && new Date() >= integration[0].googleTokenExpiry) {
      console.log("Access token expired, refreshing...");
      const refreshResult = await refreshGoogleToken(userId);
      if (!refreshResult.success) {
        return { exists: false, message: "Failed to refresh Google token" };
      }
      
      // Get updated token
      const updatedIntegration = await db
        .select()
        .from(userMapsIntegration)
        .where(eq(userMapsIntegration.userId, userId));
      
      accessToken = updatedIntegration[0].googleAccessToken;
    }

    if (!accessToken) {
      return { exists: false, message: "No valid access token" };
    }

    // Check if the file exists in Google Drive
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${mapId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log("File verification response status:", response.status);

    if (response.status === 404) {
      console.log("File not found in Google Drive");
      return { exists: false, message: "File not found in Google Drive" };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to verify file:", errorText);
      return { exists: false, message: "Failed to verify file existence" };
    }

    const fileData = await response.json();
    console.log("File exists:", fileData.name);
    
    // Note: Moving files within Drive doesn't change the file ID, so the file will still be accessible
    return { exists: true, message: "File exists in Google Drive" };

  } catch (error) {
    console.error("File verification error:", error);
    return { 
      exists: false, 
      message: error instanceof Error ? error.message : "Unknown error verifying file" 
    };
  }
}

export async function deleteKmlFromDrive(
  userId: string, 
  mapId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    console.log("=== DELETING KML FROM DRIVE ===");
    console.log("User ID:", userId);
    console.log("Map ID:", mapId);

    // Get user's Google tokens
    const integration = await db
      .select()
      .from(userMapsIntegration)
      .where(eq(userMapsIntegration.userId, userId));

    if (!integration.length || !integration[0].googleMapsConnected) {
      return { success: false, message: "Google Maps not connected" };
    }

    let accessToken = integration[0].googleAccessToken;

    // Check if token needs refresh
    if (integration[0].googleTokenExpiry && new Date() >= integration[0].googleTokenExpiry) {
      console.log("Access token expired, refreshing...");
      const refreshResult = await refreshGoogleToken(userId);
      if (!refreshResult.success) {
        return { success: false, message: "Failed to refresh Google token" };
      }
      
      // Get updated token
      const updatedIntegration = await db
        .select()
        .from(userMapsIntegration)
        .where(eq(userMapsIntegration.userId, userId));
      
      accessToken = updatedIntegration[0].googleAccessToken;
    }

    if (!accessToken) {
      return { success: false, message: "No valid access token" };
    }

    // Delete the file from Google Drive
    const deleteResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${mapId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log("Delete response status:", deleteResponse.status);

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error("Failed to delete KML file:", errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.error("Parsed delete error:", errorJson);
        return { 
          success: false, 
          message: `Delete error: ${errorJson.error?.message || errorText}` 
        };
      } catch {
        return { 
          success: false, 
          message: `Failed to delete KML file. Status: ${deleteResponse.status}. Response: ${errorText}` 
        };
      }
    }

    console.log("Successfully deleted KML file from Google Drive");
    return { 
      success: true, 
      message: "KML file deleted from Google Drive" 
    };

  } catch (error) {
    console.error("Delete KML error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Unknown error deleting KML file" 
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
