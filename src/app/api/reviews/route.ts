import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { sendReviewNotification } from '@/lib/services/emailService';

// Schema for creating a review
const createReviewSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  content: z.string().min(1, 'Review content is required'),
  photos: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to write a review' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = createReviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { businessId, rating, title, content, photos } = result.data;

    const db = await getDb();

    // Check if user has already reviewed this business
    const existingReview = await db.collection('reviews').findOne({
      businessId: new ObjectId(businessId),
      userId: new ObjectId(session.user.id),
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this business' },
        { status: 400 }
      );
    }

    // Create the review
    const review = {
      businessId: new ObjectId(businessId),
      userId: new ObjectId(session.user.id),
      rating,
      title,
      content,
      photos: photos || [],
      helpful: 0,
      reported: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result2 = await db.collection('reviews').insertOne(review);

    // Update business rating
    const reviews = await db.collection('reviews')
      .find({ businessId: new ObjectId(businessId) })
      .toArray();

    const averageRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

    // Get business details and owner
    const business = await db.collection('businesses').findOne(
      { _id: new ObjectId(businessId) }
    );

    if (business && business.claimedBy) {
      // Get owner's email
      const owner = await db.collection('users').findOne(
        { _id: business.claimedBy }
      );

      if (owner && owner.email) {
        // Send notification email
        try {
          await sendReviewNotification(owner.email, {
            businessName: business.name,
            reviewerName: session.user.name || 'Anonymous',
            rating,
            content,
            createdAt: review.createdAt.toISOString(),
            businessUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/business/${businessId}`,
            reviewId: result2.insertedId.toString(),
          });
        } catch (emailError) {
          console.error('Error sending review notification:', emailError);
          // Don't fail the request if email fails
        }
      }
    }

    await db.collection('businesses').updateOne(
      { _id: new ObjectId(businessId) },
      {
        $set: {
          rating: Math.round(averageRating * 10) / 10,
          reviewCount: reviews.length,
        },
      }
    );

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const reviews = await db.collection('reviews')
      .aggregate([
        {
          $match: {
            businessId: new ObjectId(businessId),
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $project: {
            _id: 1,
            rating: 1,
            title: 1,
            content: 1,
            photos: 1,
            helpful: 1,
            createdAt: 1,
            'user.name': 1,
            'user.image': 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
