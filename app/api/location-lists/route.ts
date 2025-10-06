import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { locationLists, listCategories, listPois, stores } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
    }

    const storeId = Number(user.privateMetadata?.storeId);
    if (!storeId) {
      return NextResponse.json({ error: true, message: 'Store not found' }, { status: 400 });
    }

    const { list, categories, pois } = await request.json();

    // Validate required fields
    if (!list.name || !list.price) {
      return NextResponse.json({ 
        error: true, 
        message: 'List name and price are required' 
      }, { status: 400 });
    }

    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Create the location list - only include safe fields
      const [newList] = await tx
        .insert(locationLists)
        .values({
          name: list.name,
          description: list.description,
          price: list.price,
          currency: list.currency,
          coverImage: list.coverImage,
          isActive: list.isActive,
          storeId,
          totalPois: pois.length,
        })
        .returning();

      // Create categories
      const categoryIds: number[] = [];
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const [newCategory] = await tx
          .insert(listCategories)
          .values({
            listId: newList.id,
            name: category.name,
            emoji: category.emoji,
            iconColor: category.iconColor,
            displayOrder: category.displayOrder,
          })
          .returning();
        categoryIds.push(newCategory.id);
      }

      // Create POIs
      for (const poi of pois) {
        const categoryId = categoryIds[poi.categoryId || 0];
        if (categoryId) {
          await tx.insert(listPois).values({
            categoryId,
            name: poi.name,
            description: poi.description,
            sellerNotes: poi.sellerNotes,
            latitude: poi.latitude,
            longitude: poi.longitude,
            googlePlaceId: poi.googlePlaceId,
            address: poi.address,
            rating: poi.rating,
            website: poi.website,
            phoneNumber: poi.phoneNumber,
            photos: poi.photos,
            displayOrder: 0,
          });
        }
      }

      return newList;
    });

    return NextResponse.json({ 
      success: true, 
      listId: result.id,
      message: 'Location list created successfully' 
    });

  } catch (error) {
    console.error('Error creating location list:', error);
    return NextResponse.json({ 
      error: true, 
      message: 'Failed to create location list' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
    }

    const storeId = Number(user.privateMetadata?.storeId);
    if (!storeId) {
      return NextResponse.json({ error: true, message: 'Store not found' }, { status: 400 });
    }

    const lists = await db
      .select()
      .from(locationLists)
      .where(eq(locationLists.storeId, storeId));

    return NextResponse.json({ lists });

  } catch (error) {
    console.error('Error fetching location lists:', error);
    return NextResponse.json({ 
      error: true, 
      message: 'Failed to fetch location lists' 
    }, { status: 500 });
  }
}
