import { NextRequest, NextResponse } from 'next/server';
import { processAllPendingSyncs } from '@/lib/google-maps-sync';

export async function GET(request: NextRequest) {
  try {
    console.log("=== MANUAL SYNC TRIGGER ===");
    
    await processAllPendingSyncs();
    
    return NextResponse.json({ 
      success: true, 
      message: "Processed all pending syncs"
    });
  } catch (error) {
    console.error('Manual sync error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
