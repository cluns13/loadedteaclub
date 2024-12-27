import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import type { LoadedTeaClub } from '@/types/models';

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

    return NextResponse.json({
      success: true,
      featuredItems: business.featuredItems || []
    });
  } catch (error) {
    console.error('Error fetching featured items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured items' },
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

    const { itemId } = await request.json();
    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
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

    // Toggle featured status
    const featuredItems = business.featuredItems || [];
    const isCurrentlyFeatured = featuredItems.includes(itemId);

    const result = await db.collection<LoadedTeaClub>('businesses').updateOne(
      { id: params.id },
      isCurrentlyFeatured
        ? { $pull: { featuredItems: itemId } }
        : { 
            $addToSet: { featuredItems: itemId },
            $setOnInsert: { promotions: [] }
          }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update featured items' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      isFeatured: !isCurrentlyFeatured
    });
  } catch (error) {
    console.error('Error updating featured items:', error);
    return NextResponse.json(
      { error: 'Failed to update featured items' },
      { status: 500 }
    );
  }
}
