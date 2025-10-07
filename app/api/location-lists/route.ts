import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { locationLists, listCategories, listPois, stores } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { checkSubscriptionForListActivation } from '@/server-actions/subscription';

export async function POST(request: NextRequest) {
  try {
    console.log("=== LOCATION LIST CREATION START ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("User-Agent:", request.headers.get('user-agent'));
    console.log("Request URL:", request.url);
    
    const user = await currentUser();
    if (!user) {
      console.log("ERROR: User not authenticated");
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
    }

    console.log("User ID:", user.id);
    console.log("User email:", user.emailAddresses[0]?.emailAddress);

    const storeId = Number(user.privateMetadata?.storeId);
    console.log("Store ID:", storeId);
    console.log("Store ID type:", typeof storeId);
    console.log("User private metadata:", user.privateMetadata);
    
    if (!storeId || isNaN(storeId)) {
      console.log("ERROR: Store not found for user - storeId is:", storeId);
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

    // Check subscription status to determine if list can be active
    const hasActiveSubscription = await checkSubscriptionForListActivation(storeId);
    const shouldBeActive = list.isActive && hasActiveSubscription;
    
    console.log("Subscription check:", {
      hasActiveSubscription,
      requestedActive: list.isActive,
      willBeActive: shouldBeActive
    });

    // If user tries to activate without subscription, inform them
    let subscriptionMessage = null;
    if (list.isActive && !hasActiveSubscription) {
      subscriptionMessage = "List saved as draft. Subscribe to activate your lists and start selling.";
    }

    // Start transaction
    console.log("Starting database transaction...");
    console.log("Database connection status: attempting transaction");
    
    // Test database connection first
    try {
      const testQuery = await db.select({ count: sql`count(*)` }).from(locationLists).where(eq(locationLists.storeId, storeId));
      console.log("Database connection test successful. Current list count for store:", testQuery[0]?.count);
    } catch (dbTestError) {
      console.error("Database connection test failed:", dbTestError);
      throw new Error("Database connection failed");
    }
    
    const result = await db.transaction(async (tx) => {
      console.log("Creating location list with data:", {
        name: list.name,
        description: list.description,
        price: list.price,
        currency: list.currency,
        isActive: shouldBeActive,
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
          isActive: shouldBeActive,
          storeId,
          totalPois: pois.length,
          country: list.country,
          cities: list.cities,
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
    console.log("Transaction completed successfully");
    
    // Force a small delay to ensure database write is fully committed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return NextResponse.json({ 
      success: true, 
      listId: result.id,
      message: subscriptionMessage || 'Location list created successfully',
      subscriptionRequired: !!subscriptionMessage
    });

  } catch (error) {
    console.error('=== LOCATION LIST CREATION ERROR ===', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
    });
    
    // Log additional context
    console.error('Request context:', {
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
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
