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
    console.log("Request data:", { 
      list, 
      categoriesCount: categories?.length || 0, 
      poisCount: pois?.length || 0,
      categoriesPreview: categories?.slice(0, 2).map(c => c.name) || [],
      poisPreview: pois?.slice(0, 2).map(p => p.name) || []
    });

    // Validate required fields
    console.log("Validating required fields:", {
      name: list.name,
      price: list.price,
      categoriesCount: categories?.length || 0,
      poisCount: pois?.length || 0
    });

    if (!list.name || !list.name.trim()) {
      console.log("ERROR: Missing or empty list name");
      return NextResponse.json({ 
        error: true, 
        message: 'List name is required' 
      }, { status: 400 });
    }

    if (!list.price || list.price === "0" || parseFloat(list.price) <= 0) {
      console.log("ERROR: Missing or invalid price:", list.price);
      return NextResponse.json({ 
        error: true, 
        message: 'List price must be greater than 0' 
      }, { status: 400 });
    }

    if (!categories || categories.length === 0) {
      console.log("ERROR: No categories provided");
      return NextResponse.json({ 
        error: true, 
        message: 'At least one category is required' 
      }, { status: 400 });
    }

    if (!pois || pois.length === 0) {
      console.log("ERROR: No POIs provided");
      return NextResponse.json({ 
        error: true, 
        message: 'At least one location (POI) is required' 
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
    
    let result;
    try {
      result = await db.transaction(async (tx) => {
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
          images: list.images,
          isActive: shouldBeActive,
          storeId,
          totalPois: pois.length,
          country: list.country,
          cities: list.cities,
        })
        .returning();

      console.log("Location list created with ID:", newList.id);

      if (!newList || !newList.id) {
        console.error("ERROR: List creation returned null or invalid result:", newList);
        throw new Error("Failed to create location list - database returned invalid result");
      }

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
        
        if (!newCategory || !newCategory.id) {
          console.error("ERROR: Category creation failed for:", category.name);
          throw new Error(`Failed to create category: ${category.name}`);
        }
        
        categoryIds.push(newCategory.id);
        console.log(`Category created with ID: ${newCategory.id}`);
      }

      // Create POIs
      console.log("Creating POIs...");
      let poisCreated = 0;
      
      for (const poi of pois) {
        // Fix: Use poi.categoryId as array index to get the actual database category ID
        const categoryIndex = poi.categoryId || 0;
        const categoryId = categoryIds[categoryIndex];
        console.log(`Creating POI: ${poi.name} with categoryIndex ${categoryIndex} -> categoryId ${categoryId}`);
        console.log(`Available categoryIds:`, categoryIds);
        
        if (categoryId && categoryIndex < categoryIds.length) {
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
          poisCreated++;
          console.log(`POI created successfully: ${poi.name}`);
        } else {
          console.log(`WARNING: Invalid category index ${categoryIndex} for POI: ${poi.name}. Available categories: ${categoryIds.length}`);
        }
      }

      if (poisCreated === 0) {
        console.error("ERROR: No POIs were successfully created");
        throw new Error("Failed to create any POIs - check category mapping");
      }

      console.log(`Successfully created ${poisCreated} POIs out of ${pois.length} requested`);

      console.log("Transaction completed successfully");
      return newList;
    });
    
    console.log("Transaction result:", result);
    } catch (transactionError) {
      console.error("=== TRANSACTION ERROR ===");
      console.error("Transaction failed:", transactionError);
      console.error("Error details:", {
        message: transactionError instanceof Error ? transactionError.message : 'Unknown transaction error',
        stack: transactionError instanceof Error ? transactionError.stack : undefined,
      });
      throw transactionError;
    }

    console.log("=== LOCATION LIST CREATION SUCCESS ===");
    console.log("Created list ID:", result.id);
    console.log("Transaction completed successfully");
    
    // Verify the list was actually created
    try {
      const verificationQuery = await db.select().from(locationLists).where(eq(locationLists.id, result.id));
      if (verificationQuery.length === 0) {
        console.error("=== VERIFICATION FAILED ===");
        console.error("List was not found in database after transaction completion!");
        throw new Error("List creation verification failed - data not persisted");
      }
      console.log("Verification successful: List exists in database");
    } catch (verificationError) {
      console.error("Verification query failed:", verificationError);
      throw new Error("Failed to verify list creation");
    }
    
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
