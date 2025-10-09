import { db } from "@/db/db";
import { locationLists } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Generate a URL-safe slug from a WanderList name
 */
export function generateWanderListSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')         // Replace spaces with hyphens
    .replace(/-+/g, '-')          // Replace multiple hyphens with single
    .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
}

/**
 * Find a WanderList by its slug
 */
export async function findWanderListBySlug(slug: string) {
  try {
    // First, try to find by exact slug match (if we stored slugs in DB)
    // Since we don't store slugs, we need to search through all active lists
    // and generate slugs to find matches
    
    const allLists = await db
      .select()
      .from(locationLists)
      .where(eq(locationLists.isActive, true));
    
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

/**
 * Generate the WanderList URL from a list name
 */
export function getWanderListUrl(name: string): string {
  const slug = generateWanderListSlug(name);
  return `/wanderlists/${slug}`;
}
