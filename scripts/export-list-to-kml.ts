import { db } from "@/db/db";
import { locationLists } from "@/db/schema";
import { ilike } from "drizzle-orm";
import { getListDataForSync, generateKML } from "@/lib/kml-generator";
import * as fs from "fs";
import * as path from "path";

async function exportListToKML(listName: string) {
  try {
    // Find the list by name
    const lists = await db
      .select()
      .from(locationLists)
      .where(ilike(locationLists.name, `%${listName}%`));

    if (lists.length === 0) {
      console.error(`No list found matching: ${listName}`);
      return;
    }

    if (lists.length > 1) {
      console.log(`Found ${lists.length} matching lists:`);
      lists.forEach((list, index) => {
        console.log(`${index + 1}. ${list.name} (ID: ${list.id})`);
      });
      console.log("\nUsing the first match...");
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

// Get list name from command line or use default
const listName = process.argv[2] || "Mornington Peninsula";

console.log(`Searching for list: ${listName}\n`);
exportListToKML(listName);

