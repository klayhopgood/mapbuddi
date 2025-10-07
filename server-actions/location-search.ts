"use server";

import { db } from "@/db/db";
import { locationLists, stores } from "@/db/schema";
import { like, eq, or, sql } from "drizzle-orm";

export async function getLocationListsBySearchTerm(searchTerm: string) {
  const searchTermLower = searchTerm.toLowerCase();
  
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
        sql`LOWER(${locationLists.name}) LIKE ${`%${searchTermLower}%`}`,
        sql`LOWER(${locationLists.description}) LIKE ${`%${searchTermLower}%`}`,
        sql`LOWER(${stores.name}) LIKE ${`%${searchTermLower}%`}`
      )
    )
    .limit(10);
    
  return results.map(item => ({ ...item, type: 'list' as const }));
}

export async function getStoresBySearchTerm(searchTerm: string) {
  const searchTermLower = searchTerm.toLowerCase();
  
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
        sql`LOWER(${stores.name}) LIKE ${`%${searchTermLower}%`}`,
        sql`LOWER(${stores.description}) LIKE ${`%${searchTermLower}%`}`
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
