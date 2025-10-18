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

    // Validate headers
    const requiredHeaders = ['name', 'address', 'latitude', 'longitude'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Missing required headers: ${missingHeaders.join(', ')}` },
        { status: 400 }
      );
    }

    // Parse CSV data
    const csvData: CSVRow[] = dataRows.map(row => {
      const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const rowData: CSVRow = {
        name: '',
        address: '',
        latitude: '',
        longitude: '',
        notes: ''
      };

      headers.forEach((header, index) => {
        if (values[index]) {
          rowData[header as keyof CSVRow] = values[index];
        }
      });

      return rowData;
    }).filter(row => row.name && row.latitude && row.longitude);

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
        country: 'Vietnam', // You might want to make this configurable
        cities: JSON.stringify(['Da Nang']), // You might want to make this configurable
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
      description: row.notes || null,
      sellerNotes: null,
      latitude: parseFloat(row.latitude).toString(),
      longitude: parseFloat(row.longitude).toString(),
      address: row.address || null,
      displayOrder: index,
    }));

    console.log('POIs to insert:', poisToInsert.length);
    await db.insert(listPois).values(poisToInsert);
    console.log('POIs inserted successfully');

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
