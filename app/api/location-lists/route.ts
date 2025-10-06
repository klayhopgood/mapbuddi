import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { locationLists, listCategories, listPois, stores } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    console.log("=== LOCATION LIST CREATION START ===");
    
    const user = await currentUser();
    if (!user) {
      console.log("ERROR: User not authenticated");
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
    }

    const storeId = Number(user.privateMetadata?.storeId);
    console.log("Store ID:", storeId);
    if (!storeId) {
      console.log("ERROR: Store not found for user");
      return NextResponse.json({ error: true, message: 'Store not found' }, { status: 400 });
    }

    const { list, categories, pois } = await request.json();
    console.log("Request data:", { list, categories: categories.length, pois: pois.length });

    // Validate required fields
    if (!list.name || !list.price) {
      console.log("ERROR: Missing required fields - name or price");
      return NextResponse.json({ 
        error: true, 
        message: 'List name and price are required' 
      }, { status: 400 });
    }

    // Start transaction
    console.log("Starting database transaction...");
    const result = await db.transaction(async (tx) => {
      console.log("Creating location list with data:", {
        name: list.name,
        description: list.description,
        price: list.price,
        currency: list.currency,
        isActive: list.isActive,
        storeId,
        totalPois: pois.length,
      });

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

      console.log("Location list created with ID:", newList.id);

      // Create categories
      console.log("Creating categories...");
      const categoryIds: number[] = [];
      for (let i = 0; i < categories.length; i++) {
        const category = categories[i];
        console.log(`Creating category ${i + 1}:`, category.name);
        
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
        console.log(`Category created with ID: ${newCategory.id}`);
      }

      // Create POIs
      console.log("Creating POIs...");
      for (const poi of pois) {
        const categoryId = categoryIds[poi.categoryId || 0];
        console.log(`Creating POI: ${poi.name} in category ${categoryId}`);
        
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
            displayOrder: 0,
          });
          console.log(`POI created successfully: ${poi.name}`);
        } else {
          console.log(`WARNING: No category ID found for POI: ${poi.name}`);
        }
      }

      console.log("Transaction completed successfully");
      return newList;
    });

    console.log("=== LOCATION LIST CREATION SUCCESS ===");
    console.log("Created list ID:", result.id);
    
    return NextResponse.json({ 
      success: true, 
      listId: result.id,
      message: 'Location list created successfully' 
    });

  } catch (error) {
    console.error('=== LOCATION LIST CREATION ERROR ===', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ 
      error: true, 
      message: error instanceof Error ? error.message : 'Failed to create location list' 
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
