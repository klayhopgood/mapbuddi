import { NextRequest, NextResponse } from 'next/server';
import { syncListToGoogleMaps } from '@/lib/google-maps-sync';
import { db } from '@/db/db';
import { purchasedListSync, userMapsIntegration } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log("=== DEBUG SYNC STATUS ===");
    
    // Get all pending syncs using raw SQL to debug Drizzle issue
    const pendingSyncsRaw = await db.execute(sql`
      SELECT * FROM purchased_list_sync 
      WHERE google_maps_sync_enabled = true AND google_maps_synced = false
    `);
    
    console.log(`Found ${pendingSyncsRaw.length} pending syncs via raw SQL`);
    
    // Also try the Drizzle query for comparison
    const pendingSyncs = await db
      .select()
      .from(purchasedListSync)
      .where(and(
        eq(purchasedListSync.googleMapsSyncEnabled, true),
        eq(purchasedListSync.googleMapsSynced, false)
      ));

    console.log(`Found ${pendingSyncs.length} pending syncs via Drizzle`);

    // Get user integrations
    const integrations = await db
      .select()
      .from(userMapsIntegration);

    console.log(`Found ${integrations.length} user integrations`);

    // Try to sync the first pending one with detailed logging
    if (pendingSyncsRaw.length > 0) {
      const sync = pendingSyncsRaw[0] as any; // Raw SQL result
      console.log(`Attempting to sync list ${sync.list_id} for user ${sync.user_id}`);
      
      try {
        const result = await syncListToGoogleMaps(
          sync.user_id, 
          sync.list_id, 
          sync.order_id
        );
        
        console.log("Sync result:", result);
        
        return NextResponse.json({
          success: true,
          pendingSyncsRaw: pendingSyncsRaw.length,
          pendingSyncsDrizzle: pendingSyncs.length,
          integrations: integrations.length,
          syncResult: result,
          debugInfo: {
            syncAttempted: sync,
            userIntegration: integrations.find(i => i.userId === sync.user_id)
          }
        });
      } catch (syncError) {
        console.error("Sync error:", syncError);
        return NextResponse.json({
          success: false,
          error: "Sync failed",
          details: syncError instanceof Error ? syncError.message : String(syncError),
          pendingSyncsRaw: pendingSyncsRaw.length,
          pendingSyncsDrizzle: pendingSyncs.length,
          integrations: integrations.length
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "No pending syncs found",
      pendingSyncsRaw: pendingSyncsRaw.length,
      pendingSyncsDrizzle: pendingSyncs.length,
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
