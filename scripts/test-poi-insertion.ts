import { db } from "@/db/db";
import { listPois, listCategories, locationLists } from "@/db/schema";
import { eq } from "drizzle-orm";

async function testPOIInsertion() {
  try {
    // Find the most recent location list
    const recentLists = await db
      .select()
      .from(locationLists)
      .orderBy(locationLists.createdAt)
      .limit(1);

    if (recentLists.length === 0) {
      console.log("No location lists found");
      return;
    }

    const list = recentLists[0];
    console.log("Testing POI insertion for list:", list.name, "(ID:", list.id, ")");

    // Get categories for this list
    const categories = await db
      .select()
      .from(listCategories)
      .where(eq(listCategories.listId, list.id));

    console.log("Categories found:", categories.length);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat.id})`);
    });

    // Get POIs for each category
    for (const category of categories) {
      const pois = await db
        .select()
        .from(listPois)
        .where(eq(listPois.categoryId, category.id));
      
      console.log(`Category "${category.name}" has ${pois.length} POIs:`);
      pois.slice(0, 3).forEach((poi, idx) => {
        console.log(`  ${idx + 1}. ${poi.name} (${poi.latitude}, ${poi.longitude})`);
      });
      if (pois.length > 3) {
        console.log(`  ... and ${pois.length - 3} more`);
      }
    }

  } catch (error) {
    console.error("Error testing POI insertion:", error);
  }
}

testPOIInsertion();
