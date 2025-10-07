"use server";

import { db } from "@/db/db";
import { locationLists, stores } from "@/db/schema";
import { like, eq, or } from "drizzle-orm";

export async function getLocationListsBySearchTerm(searchTerm: string) {
  const results = await db
    .select({
      id: locationLists.id,
      name: locationLists.name,
      description: locationLists.description,
      coverImage: locationLists.coverImage,
      price: locationLists.price,
      totalPois: locationLists.totalPois,
      storeId: locationLists.storeId,
      storeName: stores.name,
      storeSlug: stores.slug,
    })
    .from(locationLists)
    .leftJoin(stores, eq(locationLists.storeId, stores.id))
    .where(
      or(
        like(locationLists.name, `%${searchTerm}%`),
        like(locationLists.description, `%${searchTerm}%`),
        like(stores.name, `%${searchTerm}%`)
      )
    )
    .limit(10);
    
  return results.map(item => ({ ...item, type: 'list' as const }));
}

export async function getStoresBySearchTerm(searchTerm: string) {
  const results = await db
    .select({
      id: stores.id,
      name: stores.name,
      description: stores.description,
      slug: stores.slug,
    })
    .from(stores)
    .where(
      or(
        like(stores.name, `%${searchTerm}%`),
        like(stores.description, `%${searchTerm}%`)
      )
    )
    .limit(5);
    
  return results.map(item => ({ ...item, type: 'store' as const }));
}

export async function searchAll(searchTerm: string) {
  const [lists, stores] = await Promise.all([
    getLocationListsBySearchTerm(searchTerm),
    getStoresBySearchTerm(searchTerm)
  ]);
  
  return { lists, stores };
}
