import { db } from "@/db/db";
import { locationLists, listCategories, listPois } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface POIData {
  id: number;
  name: string;
  description: string | null;
  sellerNotes: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  category: {
    name: string;
    emoji: string;
    iconColor: string;
  };
}

export interface ListData {
  id: number;
  name: string;
  description: string | null;
  pois: POIData[];
}

export async function getListDataForSync(listId: number): Promise<ListData | null> {
  try {
    // Get list details
    const listDetails = await db
      .select({
        id: locationLists.id,
        name: locationLists.name,
        description: locationLists.description,
      })
      .from(locationLists)
      .where(eq(locationLists.id, listId));

    if (!listDetails.length) {
      return null;
    }

    // Get categories for this list
    const categories = await db
      .select()
      .from(listCategories)
      .where(eq(listCategories.listId, listId));

    // Get POIs for this list
    const pois = await db
      .select()
      .from(listPois)
      .where(eq(listPois.categoryId, categories[0]?.id)); // This needs to be fixed to get all categories

    // Actually, let me fix this query to get all POIs properly
    const poisWithCategories = await db
      .select({
        poi: listPois,
        category: listCategories,
      })
      .from(listPois)
      .leftJoin(listCategories, eq(listPois.categoryId, listCategories.id))
      .where(eq(listCategories.listId, listId));

    const poisData: POIData[] = poisWithCategories.map(item => ({
      id: item.poi.id,
      name: item.poi.name,
      description: item.poi.description,
      sellerNotes: item.poi.sellerNotes,
      latitude: parseFloat(item.poi.latitude),
      longitude: parseFloat(item.poi.longitude),
      address: item.poi.address,
      category: {
        name: item.category?.name || 'General',
        emoji: item.category?.emoji || '📍',
        iconColor: item.category?.iconColor || '#4ECDC4',
      },
    }));

    return {
      id: listDetails[0].id,
      name: listDetails[0].name,
      description: listDetails[0].description,
      pois: poisData,
    };
  } catch (error) {
    console.error("Error getting list data for sync:", error);
    return null;
  }
}

export function generateKML(listData: ListData): string {
  const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>${escapeXml(listData.name)}</name>
    <description>${escapeXml(listData.description || 'A curated collection of points of interest from MapBuddi')}</description>
    
    ${generateStyles(listData.pois)}
    
    ${listData.pois.map(poi => generatePlacemark(poi)).join('\n    ')}
  </Document>
</kml>`;

  return kml;
}

function generateStyles(pois: POIData[]): string {
  const uniqueCategories = Array.from(
    new Set(pois.map(poi => poi.category.name))
  );

  return uniqueCategories.map(categoryName => {
    const poi = pois.find(p => p.category.name === categoryName);
    const emoji = poi?.category.emoji || '📍';
    
    // Convert emoji to a usable icon URL using Twemoji
    const emojiCode = emoji.codePointAt(0)?.toString(16).padStart(4, '0');
    const iconUrl = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${emojiCode}.png`;
    
    return `
    <Style id="style_${categoryName.replace(/\s+/g, '_')}">
      <IconStyle>
        <Icon>
          <href>${iconUrl}</href>
        </Icon>
        <scale>1.0</scale>
        <hotSpot x="0.5" y="1" xunits="fraction" yunits="fraction"/>
      </IconStyle>
      <LabelStyle>
        <scale>0.9</scale>
        <color>ff000000</color>
      </LabelStyle>
    </Style>`;
  }).join('');
}

function generatePlacemark(poi: POIData): string {
  const styleId = `style_${poi.category.name.replace(/\s+/g, '_')}`;
  
  let description = '';
  if (poi.description) {
    description += `<b>Description:</b> ${escapeXml(poi.description)}<br/>`;
  }
  if (poi.sellerNotes) {
    description += `<b>Notes:</b> ${escapeXml(poi.sellerNotes)}<br/>`;
  }
  if (poi.address) {
    description += `<b>Address:</b> ${escapeXml(poi.address)}<br/>`;
  }
  description += `<b>Category:</b> ${poi.category.emoji} ${escapeXml(poi.category.name)}`;

  return `
    <Placemark>
      <name>${poi.category.emoji} ${escapeXml(poi.name)}</name>
      <description><![CDATA[${description}]]></description>
      <styleUrl>#${styleId}</styleUrl>
      <Point>
        <coordinates>${poi.longitude},${poi.latitude},0</coordinates>
      </Point>
    </Placemark>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function rgbToKmlColor(hexColor: string): string {
  // Convert #RRGGBB to BBGGRR for KML
  if (hexColor.startsWith('#')) {
    const hex = hexColor.slice(1);
    if (hex.length === 6) {
      const r = hex.slice(0, 2);
      const g = hex.slice(2, 4);
      const b = hex.slice(4, 6);
      return `${b}${g}${r}`;
    }
  }
  return '4ecdc4'; // Default color
}
