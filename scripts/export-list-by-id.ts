import { db } from "@/db/db";
import { locationLists } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getListDataForSync, generateKML } from "@/lib/kml-generator";
import * as fs from "fs";
import * as path from "path";

async function exportListByID(listId: number) {
  try {
    // Get the list by ID
    const lists = await db
      .select()
      .from(locationLists)
      .where(eq(locationLists.id, listId));

    if (lists.length === 0) {
      console.error(`No list found with ID: ${listId}`);
      return;
    }

    const list = lists[0];
    console.log(`\nExporting list: ${list.name} (ID: ${list.id})`);

    // Get the full list data with POIs
    const listData = await getListDataForSync(list.id);

    if (!listData) {
      console.error("Failed to get list data");
      return;
    }

    console.log(`Found ${listData.pois.length} POIs in this list`);

    if (listData.pois.length === 0) {
      console.warn("\n⚠️  Warning: This list has no POIs!");
    }

    // Generate KML
    const kmlContent = generateKML(listData);

    // Create a safe filename
    const safeFilename = listData.name
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .toLowerCase();

    // Save to file
    const outputPath = path.join(process.cwd(), `${safeFilename}.kml`);
    fs.writeFileSync(outputPath, kmlContent, 'utf-8');

    console.log(`\n✅ KML file exported successfully!`);
    console.log(`📍 Location: ${outputPath}`);
    console.log(`📊 Contains ${listData.pois.length} locations`);
  } catch (error) {
    console.error("Error exporting list:", error);
  }
}

// Get list ID from command line
const listId = parseInt(process.argv[2] || "2");

console.log(`Exporting list with ID: ${listId}\n`);
exportListByID(listId);

