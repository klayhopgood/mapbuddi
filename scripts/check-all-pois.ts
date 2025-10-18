import { db } from "@/db/db";
import { listPois, listCategories } from "@/db/schema";
import { sql } from "drizzle-orm";

async function checkAllPois() {
  try {
    // Get all POIs
    console.log("📍 Checking all POIs in database...\n");
    
    const allPois = await db.select().from(listPois).limit(20);
    console.log(`Found ${allPois.length} total POIs in database`);
    
    if (allPois.length > 0) {
      console.log("\nFirst 10 POIs:");
      allPois.slice(0, 10).forEach((poi, idx) => {
        console.log(`${idx + 1}. ${poi.name} (Category ID: ${poi.categoryId})`);
        console.log(`   Lat/Lng: ${poi.latitude}, ${poi.longitude}`);
      });
    }

    // Check categories
    console.log("\n\n📁 All Categories:");
    const allCategories = await db.select().from(listCategories).limit(20);
    console.log(`Found ${allCategories.length} categories`);
    
    allCategories.forEach(cat => {
      console.log(`   - ID: ${cat.id}, List ID: ${cat.listId}, Name: ${cat.name}`);
    });

    // Check for POIs with category IDs 1, 2, 3
    console.log("\n\n🔍 POIs for categories 1, 2, 3:");
    for (let catId = 1; catId <= 3; catId++) {
      const poisCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(listPois)
        .where(sql`category_id = ${catId}`);
      console.log(`   Category ${catId}: ${poisCount[0]?.count || 0} POIs`);
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

checkAllPois();

