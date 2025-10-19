import { db } from "@/db/db";
import { listPois, listCategories } from "@/db/schema";
import { eq } from "drizzle-orm";

async function testSinglePOI() {
  try {
    // Find the Vietnam list category
    const categories = await db
      .select()
      .from(listCategories)
      .where(eq(listCategories.listId, 3)); // Vietnam list ID

    if (categories.length === 0) {
      console.log("No categories found for Vietnam list");
      return;
    }

    const category = categories[0];
    console.log("Found category:", category);

    // Try to insert a single POI
    const testPOI = {
      categoryId: category.id,
      name: "Test POI",
      description: "Test description",
      sellerNotes: null,
      latitude: "16.0487632",
      longitude: "108.24754349999999",
      address: "Test address",
      displayOrder: 0,
    };

    console.log("Attempting to insert test POI:", testPOI);

    const result = await db.insert(listPois).values(testPOI).returning();
    console.log("Successfully inserted POI:", result);

  } catch (error) {
    console.error("Error inserting test POI:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
  }
}

testSinglePOI();
