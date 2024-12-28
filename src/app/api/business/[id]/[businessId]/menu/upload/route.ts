import { NextResponse } from 'next/server';
import { processMenuFile } from '@/lib/services/menu-extraction';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
  req: Request,
  { params }: { params: { businessId: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify business ownership
    const db = await getDb();
    const business = await db.collection('businesses').findOne({
      _id: new ObjectId(params.businessId),
      userId: session.user.id,
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Get form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Process the menu file
    const buffer = Buffer.from(await file.arrayBuffer());
    const processedMenu = await processMenuFile(buffer, file.name);

    if (!processedMenu) {
      return NextResponse.json(
        { error: 'Failed to process menu' },
        { status: 500 }
      );
    }

    // Save menu items to database
    await createMenuItems(params.businessId, processedMenu);

    return NextResponse.json({ 
      processedMenu,
      message: 'Menu processed successfully' 
    });

  } catch (error) {
    console.error('Error processing menu:', error);
    return NextResponse.json(
      { error: 'Failed to process menu' },
      { status: 500 }
    );
  }
}

async function createMenuItems(businessId: string, processedMenu: any) {
  const db = await getDb();
  const menuItems = processedMenu.items.map((item: any) => ({
    businessId: new ObjectId(businessId),
    name: item.name,
    description: item.description || '',
    price: item.price || 0,
    category: item.category || 'Uncategorized',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  if (menuItems.length > 0) {
    await db.collection('menuItems').insertOne({ menuItems });
  }
}
