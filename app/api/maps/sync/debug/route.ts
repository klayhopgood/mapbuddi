import { NextRequest, NextResponse } from 'next/server';
import { syncListToGoogleMaps } from '@/lib/google-maps-sync';
import { db } from '@/db/db';
import { purchasedListSync, userMapsIntegration } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log("=== DEBUG SYNC STATUS ===");
    
    // Get all pending syncs
    const pendingSyncs = await db
      .select()
      .from(purchasedListSync)
      .where(and(
        eq(purchasedListSync.googleMapsSyncEnabled, true),
        eq(purchasedListSync.googleMapsSynced, false)
      ));

    console.log(`Found ${pendingSyncs.length} pending syncs`);

    // Get user integrations
    const integrations = await db
      .select()
      .from(userMapsIntegration);

    console.log(`Found ${integrations.length} user integrations`);

    // Try to sync the first pending one with detailed logging
    if (pendingSyncs.length > 0) {
      const sync = pendingSyncs[0];
      console.log(`Attempting to sync list ${sync.listId} for user ${sync.userId}`);
      
      try {
        const result = await syncListToGoogleMaps(
          sync.userId, 
          sync.listId, 
          sync.orderId
        );
        
        console.log("Sync result:", result);
        
        return NextResponse.json({
          success: true,
          pendingSyncs: pendingSyncs.length,
          integrations: integrations.length,
          syncResult: result,
          debugInfo: {
            syncAttempted: sync,
            userIntegration: integrations.find(i => i.userId === sync.userId)
          }
        });
      } catch (syncError) {
        console.error("Sync error:", syncError);
        return NextResponse.json({
          success: false,
          error: "Sync failed",
          details: syncError instanceof Error ? syncError.message : String(syncError),
          pendingSyncs: pendingSyncs.length,
          integrations: integrations.length
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "No pending syncs found",
      pendingSyncs: pendingSyncs.length,
      integrations: integrations.length
    });

  } catch (error) {
    console.error('Debug sync error:', error);
    return NextResponse.json({ 
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
