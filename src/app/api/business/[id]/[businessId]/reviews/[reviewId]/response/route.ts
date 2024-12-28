import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const responseSchema = z.object({
  content: z.string().min(1, 'Response content is required'),
});

interface Review {
  _id: ObjectId;
  businessId: ObjectId;
  response?: {
    content: string;
    createdAt: string;
    updatedAt?: string;
  };
}

export async function POST(
  request: Request,
  { params }: { params: { businessId: string; reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const db = await getDb();
    
    // Check if user owns this business
    const business = await db.collection('businesses').findOne({
      _id: new ObjectId(params.businessId),
      claimedBy: new ObjectId(session.user.id),
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found or not authorized' },
        { status: 404 }
      );
    }

    // Check if review exists and belongs to this business
    const review = await db.collection('reviews').findOne({
      _id: new ObjectId(params.reviewId),
      businessId: new ObjectId(params.businessId),
    }) as Review | null;

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if review already has a response
    if (review.response) {
      return NextResponse.json(
        { error: 'Review already has a response' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = responseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );
    }

    const response = {
      content: result.data.content,
      createdAt: new Date().toISOString(),
    };

    // Add response to review
    await db.collection('reviews').updateOne(
      { _id: new ObjectId(params.reviewId) },
      { $set: { response } }
    );

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error('Error creating review response:', error);
    return NextResponse.json(
      { error: 'Failed to create review response' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { businessId: string; reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const db = await getDb();
    
    // Check if user owns this business
    const business = await db.collection('businesses').findOne({
      _id: new ObjectId(params.businessId),
      claimedBy: new ObjectId(session.user.id),
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found or not authorized' },
        { status: 404 }
      );
    }

    // Check if review exists and belongs to this business
    const review = await db.collection('reviews').findOne({
      _id: new ObjectId(params.reviewId),
      businessId: new ObjectId(params.businessId),
    }) as Review | null;

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if review has a response
    if (!review.response) {
      return NextResponse.json(
        { error: 'Review has no response to update' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = responseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );
    }

    const response = {
      ...review.response,
      content: result.data.content,
      updatedAt: new Date().toISOString(),
    };

    // Update response
    await db.collection('reviews').updateOne(
      { _id: new ObjectId(params.reviewId) },
      { $set: { response } }
    );

    return NextResponse.json({ success: true, response });
  } catch (error) {
    console.error('Error updating review response:', error);
    return NextResponse.json(
      { error: 'Failed to update review response' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { businessId: string; reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const db = await getDb();
    
    // Check if user owns this business
    const business = await db.collection('businesses').findOne({
      _id: new ObjectId(params.businessId),
      claimedBy: new ObjectId(session.user.id),
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found or not authorized' },
        { status: 404 }
      );
    }

    // Remove response from review
    await db.collection('reviews').updateOne(
      { _id: new ObjectId(params.reviewId) },
      { $unset: { response: "" } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review response:', error);
    return NextResponse.json(
      { error: 'Failed to delete review response' },
      { status: 500 }
    );
  }
}
