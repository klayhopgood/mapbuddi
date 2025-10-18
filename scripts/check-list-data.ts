import { db } from "@/db/db";
import { locationLists, listCategories, listPois } from "@/db/schema";
import { eq } from "drizzle-orm";

async function checkListData() {
  try {
    // Get the Mornington Peninsula list
    const lists = await db
      .select()
      .from(locationLists)
      .where(eq(locationLists.id, 1));

    if (lists.length === 0) {
      console.log("List not found");
      return;
    }

    const list = lists[0];
    console.log("\n📋 List Details:");
    console.log(`   ID: ${list.id}`);
    console.log(`   Name: ${list.name}`);
    console.log(`   Total POIs (field): ${list.totalPois}`);
    console.log(`   Store ID: ${list.storeId}`);

    // Get categories for this list
    const categories = await db
      .select()
      .from(listCategories)
      .where(eq(listCategories.listId, list.id));

    console.log(`\n📁 Categories: ${categories.length}`);
    categories.forEach(cat => {
      console.log(`   - ${cat.emoji} ${cat.name} (ID: ${cat.id})`);
    });

    // Get all POIs for each category
    let totalPois = 0;
    for (const category of categories) {
      const pois = await db
        .select()
        .from(listPois)
        .where(eq(listPois.categoryId, category.id));
      
      console.log(`\n   Category "${category.name}" has ${pois.length} POIs:`);
      pois.forEach((poi, idx) => {
        console.log(`      ${idx + 1}. ${poi.name} (${poi.latitude}, ${poi.longitude})`);
        totalPois++;
      });
    }

    console.log(`\n✅ Total POIs across all categories: ${totalPois}`);

  } catch (error) {
    console.error("Error:", error);
  }
}

checkListData();

