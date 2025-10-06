import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/db/db';
import { locationLists, listCategories, listPois } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

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

    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Update the location list
      const [updatedList] = await tx
        .update(locationLists)
        .set({
          ...list,
          totalPois: pois.length,
          updatedAt: new Date(),
        })
        .where(eq(locationLists.id, listId))
        .returning();

      // Delete existing POIs first (by getting categories for this list)
      const existingCategories = await tx
        .select({ id: listCategories.id })
        .from(listCategories)
        .where(eq(listCategories.listId, listId));
      
      if (existingCategories.length > 0) {
        const categoryIds = existingCategories.map(cat => cat.id);
        await tx.delete(listPois).where(
          inArray(listPois.categoryId, categoryIds)
        );
      }
      
      // Delete existing categories
      await tx.delete(listCategories).where(eq(listCategories.listId, listId));

      // Create new categories
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
      }

      // Create new POIs
      for (const poi of pois) {
        const categoryId = categoryIds[poi.categoryId || 0];
        if (categoryId) {
          await tx.insert(listPois).values({
            categoryId,
            name: poi.name,
            description: poi.description,
            sellerNotes: poi.sellerNotes,
            latitude: poi.latitude.toString(),
            longitude: poi.longitude.toString(),
            googlePlaceId: poi.googlePlaceId,
            address: poi.address,
            displayOrder: 0,
          });
        }
      }

      return updatedList;
    });

    return NextResponse.json({ 
      success: true, 
      listId: result.id,
      message: 'Location list updated successfully' 
    });

  } catch (error) {
    console.error('Error updating location list:', error);
    return NextResponse.json({ 
      error: true, 
      message: 'Failed to update location list' 
    }, { status: 500 });
  }
}
