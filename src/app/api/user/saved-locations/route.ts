import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDb();
    const savedLocations = await db.collection('savedLocations')
      .aggregate([
        {
          $match: {
            userId: new ObjectId(session.user.id),
          },
        },
        {
          $lookup: {
            from: 'businesses',
            localField: 'businessId',
            foreignField: '_id',
            as: 'business',
          },
        },
        {
          $unwind: '$business',
        },
        {
          $project: {
            _id: 1,
            businessId: 1,
            savedAt: 1,
            'business.name': 1,
            'business.address': 1,
            'business.city': 1,
            'business.state': 1,
            'business.rating': 1,
            'business.imageUrl': 1,
          },
        },
      ])
      .toArray();

    return NextResponse.json({ locations: savedLocations });
  } catch (error) {
    console.error('Error fetching saved locations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved locations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { businessId } = await request.json();
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Check if already saved
    const existing = await db.collection('savedLocations').findOne({
      userId: new ObjectId(session.user.id),
      businessId: new ObjectId(businessId),
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Location already saved' },
        { status: 400 }
      );
    }

    // Save the location
    await db.collection('savedLocations').insertOne({
      userId: new ObjectId(session.user.id),
      businessId: new ObjectId(businessId),
      savedAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving location:', error);
    return NextResponse.json(
      { error: 'Failed to save location' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { businessId } = await request.json();
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result = await db.collection('savedLocations').deleteOne({
      userId: new ObjectId(session.user.id),
      businessId: new ObjectId(businessId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing saved location:', error);
    return NextResponse.json(
      { error: 'Failed to remove saved location' },
      { status: 500 }
    );
  }
}
