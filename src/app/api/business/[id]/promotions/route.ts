import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import type { LoadedTeaClub, Promotion } from '@/types/models';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const business = await db.collection<LoadedTeaClub>('businesses').findOne({
      id: params.id
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Return only active promotions for non-owners
    const session = await getServerSession(authOptions);
    const isOwner = session?.user?.id && business.claimedBy?.toString() === session.user.id;

    const promotions = business.promotions || [];
    return NextResponse.json({
      success: true,
      promotions: isOwner ? promotions : promotions.filter(p => p.isActive)
    });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promotions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!params.id) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const promotionData = await request.json();
    if (!promotionData.title || !promotionData.description || !promotionData.startDate) {
      return NextResponse.json(
        { error: 'Title, description, and start date are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Check if user owns this business
    const business = await db.collection<LoadedTeaClub>('businesses').findOne({
      id: params.id,
      claimedBy: new ObjectId(session.user.id)
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found or not authorized' },
        { status: 404 }
      );
    }

    const newPromotion: Promotion = {
      id: uuidv4(),
      title: promotionData.title,
      description: promotionData.description,
      startDate: new Date(promotionData.startDate),
      endDate: promotionData.endDate ? new Date(promotionData.endDate) : undefined,
      isActive: promotionData.isActive ?? true,
      discountType: promotionData.discountType,
      discountValue: promotionData.discountValue,
      terms: promotionData.terms,
      menuItems: promotionData.menuItems || [],
      imageUrl: promotionData.imageUrl,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection<LoadedTeaClub>('businesses').updateOne(
      { id: params.id },
      { 
        $push: { promotions: newPromotion },
        $setOnInsert: { featuredItems: [] }
      }
    );

    return NextResponse.json({ success: true, promotion: newPromotion });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json(
      { error: 'Failed to create promotion' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!params.id) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const promotionData = await request.json();
    if (!promotionData.id || !promotionData.title || !promotionData.description || !promotionData.startDate) {
      return NextResponse.json(
        { error: 'Promotion ID, title, description, and start date are required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Check if user owns this business
    const business = await db.collection<LoadedTeaClub>('businesses').findOne({
      id: params.id,
      claimedBy: new ObjectId(session.user.id)
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found or not authorized' },
        { status: 404 }
      );
    }

    const updatedPromotion = {
      ...promotionData,
      startDate: new Date(promotionData.startDate),
      endDate: promotionData.endDate ? new Date(promotionData.endDate) : undefined,
      updatedAt: new Date()
    };

    const result = await db.collection<LoadedTeaClub>('businesses').updateOne(
      { 
        id: params.id,
        'promotions.id': promotionData.id
      },
      { $set: { 'promotions.$': updatedPromotion } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, promotion: updatedPromotion });
  } catch (error) {
    console.error('Error updating promotion:', error);
    return NextResponse.json(
      { error: 'Failed to update promotion' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!params.id) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const promotionId = searchParams.get('promotionId');

    if (!promotionId) {
      return NextResponse.json(
        { error: 'Promotion ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Check if user owns this business
    const business = await db.collection<LoadedTeaClub>('businesses').findOne({
      id: params.id,
      claimedBy: new ObjectId(session.user.id)
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found or not authorized' },
        { status: 404 }
      );
    }

    const result = await db.collection<LoadedTeaClub>('businesses').updateOne(
      { id: params.id },
      { $pull: { promotions: { id: promotionId } } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return NextResponse.json(
      { error: 'Failed to delete promotion' },
      { status: 500 }
    );
  }
}
