import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { locationLists, listCategories, listPois } from '@/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';
import { checkSubscriptionForListActivation } from '@/server-actions/subscription';

export async function PUT(
  request: NextRequest, 
  { params }: { params: { listId: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: true, message: 'Unauthorized' }, { status: 401 });
    }

    const storeId = Number(user.privateMetadata?.storeId);
    if (!storeId) {
      return NextResponse.json({ error: true, message: 'Store not found' }, { status: 400 });
    }

    const listId = parseInt(params.listId);
    const { list, categories, pois } = await request.json();

    // Verify ownership
    const [existingList] = await db
      .select()
      .from(locationLists)
      .where(eq(locationLists.id, listId));

    if (!existingList || existingList.storeId !== storeId) {
      return NextResponse.json({ error: true, message: 'List not found' }, { status: 404 });
    }

         // Validate required fields
         console.log("Validating required fields:", {
           name: list.name,
           description: list.description,
           price: list.price,
           imagesCount: list.images ? JSON.parse(list.images).length : 0,
           categoriesCount: categories?.length || 0,
           poisCount: pois?.length || 0
         });

         if (!list.name || !list.name.trim()) {
           return NextResponse.json({ 
             error: true, 
             message: 'List name is required' 
           }, { status: 400 });
         }

         if (!list.description || !list.description.trim()) {
           return NextResponse.json({ 
             error: true, 
             message: 'List description is required' 
           }, { status: 400 });
         }

         if (!list.price || list.price === "0" || parseFloat(list.price) < 5) {
           return NextResponse.json({ 
             error: true, 
             message: 'List price must be at least $5.00' 
           }, { status: 400 });
         }

         // Validate images requirement
         const imagesList = list.images ? JSON.parse(list.images) : [];
         if (imagesList.length < 3) {
           return NextResponse.json({ 
             error: true, 
             message: 'At least 3 images from your trip are required to publish a list' 
           }, { status: 400 });
         }

         // CRITICAL FIX: Only validate categories/pois if they are being provided and updated
         // If they're not provided, preserve existing ones
         const updatingCategoriesAndPois = categories !== undefined && pois !== undefined;
         
         if (updatingCategoriesAndPois) {
           if (!categories || categories.length === 0) {
             return NextResponse.json({ 
               error: true, 
               message: 'At least one category is required' 
             }, { status: 400 });
           }

           if (!pois || pois.length < 5) {
             return NextResponse.json({ 
               error: true, 
               message: 'At least 5 locations (POIs) are required to publish a list' 
             }, { status: 400 });
           }
         }

    // Check subscription status to determine if list can be active
    const hasActiveSubscription = await checkSubscriptionForListActivation(storeId);
    const shouldBeActive = list.isActive && hasActiveSubscription;
    
    // If user tries to activate without subscription, inform them
    let subscriptionMessage = null;
    if (list.isActive && !hasActiveSubscription) {
      subscriptionMessage = "List saved as draft. Subscribe to activate your lists and start selling.";
    }

    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Get existing POI count if we're not updating POIs
      const existingPoiCount = updatingCategoriesAndPois 
        ? pois.length 
        : (await tx
            .select({ count: sql<number>`count(*)` })
            .from(listPois)
            .innerJoin(listCategories, eq(listPois.categoryId, listCategories.id))
            .where(eq(listCategories.listId, listId))
          )[0]?.count || 0;

      // Update the location list - only include safe fields
      const [updatedList] = await tx
        .update(locationLists)
        .set({
          name: list.name,
          description: list.description,
          price: list.price,
          currency: list.currency,
          coverImage: list.coverImage,
          images: list.images,
          isActive: shouldBeActive,
          totalPois: updatingCategoriesAndPois ? pois.length : existingPoiCount,
          country: list.country,
          cities: list.cities,
          updatedAt: new Date(),
        })
        .where(eq(locationLists.id, listId))
        .returning();

      // CRITICAL FIX: Only update categories and POIs if they are explicitly provided
      // This prevents accidental deletion when only updating other fields like images
      if (updatingCategoriesAndPois) {
        // Get existing categories to build a mapping from old to new IDs
        const existingCategories = await tx
          .select({ id: listCategories.id, name: listCategories.name, displayOrder: listCategories.displayOrder })
          .from(listCategories)
          .where(eq(listCategories.listId, listId));
        
        // Create a mapping from category displayOrder/index to existing category ID
        // This allows us to preserve category IDs when possible
        const categoryMapping = new Map<number, number>();
        
        // Delete existing POIs first (by getting categories for this list)
        if (existingCategories.length > 0) {
          const existingCategoryIds = existingCategories.map(cat => cat.id);
          await tx.delete(listPois).where(
            inArray(listPois.categoryId, existingCategoryIds)
          );
        }
        
        // Delete existing categories
        await tx.delete(listCategories).where(eq(listCategories.listId, listId));

        // Create new categories and map them
        const categoryIds: number[] = [];
        for (let i = 0; i < categories.length; i++) {
          const category = categories[i];
          const [newCategory] = await tx
            .insert(listCategories)
            .values({
              listId: listId,
              name: category.name,
              emoji: category.emoji,
              iconColor: category.iconColor,
              displayOrder: category.displayOrder,
            })
            .returning();
          categoryIds.push(newCategory.id);
          categoryMapping.set(i, newCategory.id);
        }

        // Create new POIs
        // CRITICAL FIX: POIs should have categoryId as the INDEX in the categories array, not database ID
        for (const poi of pois) {
          // categoryId in the POI is the index in the categories array
          const categoryIndex = typeof poi.categoryId === 'number' ? poi.categoryId : 0;
          const categoryId = categoryIds[categoryIndex];
          
          console.log(`Creating POI: ${poi.name} with categoryIndex ${categoryIndex} -> categoryId ${categoryId}`);
          console.log(`Available categoryIds:`, categoryIds);
          
          if (categoryId !== undefined && categoryIndex < categoryIds.length) {
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
            console.error(`ERROR: Invalid category index ${categoryIndex} for POI: ${poi.name}. Available categories: ${categoryIds.length}`);
          }
        }
      }

      return updatedList;
    });

    return NextResponse.json({ 
      success: true, 
      listId: result.id,
      message: subscriptionMessage || 'Location list updated successfully',
      subscriptionRequired: !!subscriptionMessage
    });

  } catch (error) {
    console.error('Error updating location list:', error);
    return NextResponse.json({ 
      error: true, 
      message: 'Failed to update location list' 
    }, { status: 500 });
  }
}
