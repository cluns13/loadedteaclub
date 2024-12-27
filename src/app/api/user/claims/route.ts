import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import type { BusinessClaim } from '@/types/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDb();
    
    // Get all claims for the user with business details
    const claims = await db.collection<BusinessClaim>('businessClaims')
      .aggregate([
        {
          $match: {
            userId: new ObjectId(session.user.id)
          }
        },
        {
          $lookup: {
            from: 'businesses',
            localField: 'businessId',
            foreignField: '_id',
            as: 'business'
          }
        },
        {
          $unwind: '$business'
        },
        {
          $project: {
            _id: 1,
            businessId: 1,
            status: 1,
            createdAt: 1,
            'business.name': 1,
            'business.city': 1,
            'business.state': 1
          }
        },
        {
          $sort: { createdAt: -1 }
        }
      ])
      .toArray();

    return NextResponse.json({ claims });
  } catch (error) {
    console.error('Error fetching user claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}
