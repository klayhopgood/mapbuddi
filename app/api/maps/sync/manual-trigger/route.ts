import { NextRequest, NextResponse } from 'next/server';
import { syncListToGoogleMaps } from '@/lib/google-maps-sync';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listId = searchParams.get('listId');
    const orderId = searchParams.get('orderId');

    if (!listId || !orderId) {
      return NextResponse.json({ 
        error: 'Missing parameters',
        usage: 'Add ?listId=X&orderId=Y to the URL'
      }, { status: 400 });
    }

    console.log(`=== MANUAL SYNC TRIGGER ===`);
    console.log(`User: ${user.id}`);
    console.log(`List ID: ${listId}`);
    console.log(`Order ID: ${orderId}`);

    const result = await syncListToGoogleMaps(user.id, parseInt(listId), parseInt(orderId));

    return NextResponse.json({
      success: result.success,
      message: result.message,
      mapId: result.mapId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Manual sync error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
