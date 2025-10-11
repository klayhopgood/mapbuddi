import { db } from "@/db/db";
import { locationLists } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { generateWanderListSlug } from "@/lib/wanderlist-utils";

/**
 * Find a WanderList by its slug (server-side only)
 */
export async function findWanderListBySlug(slug: string) {
  try {
    // Since we don't store slugs in the database, we need to search through all active lists
    // and generate slugs to find matches
    
    const allLists = await db
      .select()
      .from(locationLists)
      .where(and(
        eq(locationLists.isActive, true),
        isNull(locationLists.deletedAt) // Exclude deleted lists
      ));
    
    // Find the list whose generated slug matches the requested slug
    for (const list of allLists) {
      const generatedSlug = generateWanderListSlug(list.name);
      if (generatedSlug === slug) {
        return list;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error finding WanderList by slug:", error);
    return null;
  }
}
