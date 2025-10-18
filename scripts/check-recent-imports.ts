import { db } from "@/db/db";
import { locationLists, listCategories, listPois } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

async function checkRecentImports() {
  try {
    // Get the 5 most recent lists
    const recentLists = await db
      .select()
      .from(locationLists)
      .orderBy(desc(locationLists.createdAt))
      .limit(5);

    console.log("Most recent lists:");
    for (let i = 0; i < recentLists.length; i++) {
      const list = recentLists[i];
      console.log(`\n${i + 1}. "${list.name}" (ID: ${list.id})`);
      console.log(`   Created: ${list.createdAt}`);
      console.log(`   Store ID: ${list.storeId}`);
      console.log(`   Total POIs: ${list.totalPois}`);
      console.log(`   Is Active: ${list.isActive}`);
      console.log(`   Country: ${list.country}`);
      console.log(`   Cities: ${list.cities}`);

      // Get categories and POI counts
      const categories = await db
        .select()
        .from(listCategories)
        .where(eq(listCategories.listId, list.id));

      console.log(`   Categories: ${categories.length}`);
      
      let totalActualPois = 0;
      for (const category of categories) {
        const pois = await db
          .select()
          .from(listPois)
          .where(eq(listPois.categoryId, category.id));
        
        totalActualPois += pois.length;
        console.log(`     - ${category.name}: ${pois.length} POIs`);
      }
      
      console.log(`   Actual POI count: ${totalActualPois}`);
      
      if (totalActualPois === 0) {
        console.log(`   ⚠️  WARNING: This list has 0 POIs despite claiming ${list.totalPois}!`);
      }
    }

  } catch (error) {
    console.error("Error checking recent imports:", error);
  }
}

checkRecentImports();
