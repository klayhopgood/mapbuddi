import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { locationLists, purchasedLists } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getListDataForSync, generateKML } from '@/lib/kml-generator';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const listId = parseInt(params.listId);
    
    if (isNaN(listId)) {
      return NextResponse.json(
        { error: 'Invalid list ID' },
        { status: 400 }
      );
    }

    // Check if user has purchased this list
    const purchased = await db
      .select()
      .from(purchasedLists)
      .where(
        and(
          eq(purchasedLists.userId, user.id),
          eq(purchasedLists.listId, listId)
        )
      );

    if (purchased.length === 0) {
      return NextResponse.json(
        { error: 'You have not purchased this list' },
        { status: 403 }
      );
    }

    // Get the list data
    const listData = await getListDataForSync(listId);

    if (!listData) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    // Generate KML
    const kmlContent = generateKML(listData);

    // Create a safe filename from the list name
    const safeFilename = listData.name
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .toLowerCase();

    // Return the KML file as a download
    return new NextResponse(kmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.google-earth.kml+xml',
        'Content-Disposition': `attachment; filename="${safeFilename}.kml"`,
      },
    });
  } catch (error) {
    console.error('Error generating KML:', error);
    return NextResponse.json(
      { error: 'Failed to generate KML file' },
      { status: 500 }
    );
  }
}

