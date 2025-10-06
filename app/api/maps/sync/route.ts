import { NextRequest, NextResponse } from 'next/server';
import { syncListToGoogleMaps, processAllPendingSyncs, deleteKmlFromDrive, verifyKmlFileExists } from '@/lib/google-maps-sync';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, listId, orderId, mapId } = await request.json();

    if (action === 'sync_list') {
      if (!listId || !orderId) {
        return NextResponse.json({ error: 'Missing listId or orderId' }, { status: 400 });
      }

      console.log(`API: Syncing list ${listId} for user ${user.id}`);
      
      const result = await syncListToGoogleMaps(user.id, listId, orderId);
      
      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          message: result.message,
          mapId: result.mapId 
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          message: result.message 
        }, { status: 400 });
      }
    }

    if (action === 'process_all_pending') {
      // This could be called by a cron job or admin
      await processAllPendingSyncs();
      return NextResponse.json({ success: true, message: 'Processed all pending syncs' });
    }

    if (action === 'cleanup_file') {
      if (!mapId) {
        return NextResponse.json({ error: 'Missing mapId' }, { status: 400 });
      }

      console.log(`API: Cleaning up map ${mapId} for user ${user.id}`);
      
      const result = await deleteKmlFromDrive(user.id, mapId);
      
      if (result.success) {
        return NextResponse.json({ 
          success: true, 
          message: result.message
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          message: result.message 
        }, { status: 400 });
      }
    }

    if (action === 'verify_file') {
      if (!mapId) {
        return NextResponse.json({ error: 'Missing mapId' }, { status: 400 });
      }

      console.log(`API: Verifying map ${mapId} for user ${user.id}`);
      
      const result = await verifyKmlFileExists(user.id, mapId);
      
      return NextResponse.json({ 
        exists: result.exists, 
        message: result.message
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Sync API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
