import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/db';
import { locationLists, listCategories, listPois, stores } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

interface CSVRow {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  notes: string;
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin - for now, allow any authenticated user
    // You can customize this check based on your admin requirements
    console.log('User attempting CSV import:', {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      metadata: user.publicMetadata
    });

    const formData = await request.formData();
    const csvFile = formData.get('csvFile') as File;
    const listName = formData.get('listName') as string;
    const storeId = formData.get('storeId') as string;
    const categoryName = formData.get('categoryName') as string || 'General';

    console.log('CSV Import request data:', {
      hasFile: !!csvFile,
      fileName: csvFile?.name,
      listName,
      storeId,
      categoryName
    });

    if (!csvFile || !listName || !storeId) {
      console.log('Missing required fields:', { csvFile: !!csvFile, listName, storeId });
      return NextResponse.json(
        { error: 'Missing required fields: csvFile, listName, storeId' },
        { status: 400 }
      );
    }

    // Verify the store exists and get store details
    console.log('Looking for store with ID:', storeId);
    const store = await db
      .select()
      .from(stores)
      .where(eq(stores.id, parseInt(storeId)))
      .then(res => res[0]);

    console.log('Found store:', store);

    if (!store) {
      console.log('Store not found for ID:', storeId);
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Parse CSV content
    const csvContent = await csvFile.text();
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    console.log('CSV content parsed:', {
      totalLines: lines.length,
      firstLine: lines[0],
      sampleData: lines.slice(0, 3)
    });
    
    if (lines.length < 2) {
      console.log('CSV has insufficient lines:', lines.length);
      return NextResponse.json(
        { error: 'CSV must have at least a header row and one data row' },
        { status: 400 }
      );
    }

    // Parse header and data rows
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const dataRows = lines.slice(1);

    console.log('Headers found:', headers);

    // Validate headers
    const requiredHeaders = ['name', 'address', 'latitude', 'longitude'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      console.log('Missing headers:', missingHeaders);
      return NextResponse.json(
        { error: `Missing required headers: ${missingHeaders.join(', ')}` },
        { status: 400 }
      );
    }

    // Parse CSV data with proper CSV parsing (handles quoted fields with commas)
    const csvData: CSVRow[] = dataRows.map((row, rowIndex) => {
      // Simple CSV parser that handles quoted fields
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Add the last field
      
      const rowData: CSVRow = {
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        notes: ''
      };

      headers.forEach((header, index) => {
        if (values[index]) {
          // Remove surrounding quotes
          const value = values[index].replace(/^"|"$/g, '');
          rowData[header as keyof CSVRow] = value;
        }
      });

      console.log(`Row ${rowIndex + 1}:`, {
        name: rowData.name,
        lat: rowData.latitude,
        lng: rowData.longitude,
        hasAddress: !!rowData.address
      });

      return rowData;
    }).filter(row => {
      const isValid = row.name && row.latitude && row.longitude;
      if (!isValid) {
        console.log('Filtering out invalid row:', row);
      }
      return isValid;
    });

    console.log('Parsed CSV data:', {
      validRows: csvData.length,
      sampleRow: csvData[0]
    });

    if (csvData.length === 0) {
      console.log('No valid CSV data found');
      return NextResponse.json(
        { error: 'No valid data rows found' },
        { status: 400 }
      );
    }

    // Create the location list (as draft)
    console.log('Creating location list...');
    const [newList] = await db
      .insert(locationLists)
      .values({
        name: listName,
        description: `Imported from CSV on ${new Date().toLocaleDateString()}`,
        price: '0.00',
        currency: store.currency || 'USD',
        storeId: parseInt(storeId),
        isActive: false, // Save as draft
        totalPois: csvData.length,
        country: null, // Let it be null for now
        cities: null, // Let it be null for now
      })
      .returning();

    console.log('Created location list:', newList);

    // Create a category for the imported POIs
    console.log('Creating category...');
    const [newCategory] = await db
      .insert(listCategories)
      .values({
        listId: newList.id,
        name: categoryName,
        emoji: '📍',
        iconColor: '#4ECDC4',
        displayOrder: 0,
      })
      .returning();

    console.log('Created category:', newCategory);

    // Insert all POIs
    console.log('Inserting POIs...');
    const poisToInsert = csvData.map((row, index) => ({
      categoryId: newCategory.id,
      name: row.name,
      description: null, // Keep description null
      sellerNotes: row.notes || null, // Notes from CSV go to sellerNotes
      latitude: parseFloat(row.latitude).toString(),
      longitude: parseFloat(row.longitude).toString(),
      address: `${parseFloat(row.latitude).toFixed(6)}, ${parseFloat(row.longitude).toFixed(6)}`, // Format as "lat, lng"
      displayOrder: index,
    }));

    console.log('POIs to insert:', poisToInsert.length);
    console.log('Sample POI data:', poisToInsert[0]);
    
    try {
      // Insert POIs in batches to avoid potential issues
      const batchSize = 50;
      let totalInserted = 0;
      
      for (let i = 0; i < poisToInsert.length; i += batchSize) {
        const batch = poisToInsert.slice(i, i + batchSize);
        console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}: ${batch.length} POIs`);
        
        const insertedPois = await db.insert(listPois).values(batch).returning();
        totalInserted += insertedPois.length;
        console.log(`Batch inserted: ${insertedPois.length} POIs`);
      }
      
      console.log(`Total POIs inserted successfully: ${totalInserted}`);
      
      if (totalInserted !== poisToInsert.length) {
        console.warn(`Warning: Expected ${poisToInsert.length} POIs, but inserted ${totalInserted}`);
      }
      
    } catch (poiError) {
      console.error('Error inserting POIs:', poiError);
      console.error('Error details:', poiError instanceof Error ? poiError.message : String(poiError));
      throw poiError;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${csvData.length} locations to draft list "${listName}"`,
      listId: newList.id,
      storeName: store.name,
      locationCount: csvData.length,
    });

  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json(
      { error: 'Failed to import CSV' },
      { status: 500 }
    );
  }
}
