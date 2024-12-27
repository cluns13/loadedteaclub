import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

// Schema for updating business details
const updateBusinessSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  hours: z.record(z.string()).optional(),
  menu: z.array(z.object({
    name: z.string(),
    category: z.string(),
    description: z.string().optional(),
    price: z.number().optional(),
    popular: z.boolean().optional(),
  })).optional(),
  popularItems: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  socialMedia: z.object({
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
  }).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: { businessId: string } }
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

    const body = await request.json();
    const result = updateBusinessSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );
    }

    const updateData = result.data;

    // Update business
    await db.collection('businesses').updateOne(
      { _id: new ObjectId(params.businessId) },
      { $set: updateData }
    );

    return NextResponse.json({ success: true, business: { ...business, ...updateData } });
  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json(
      { error: 'Failed to update business' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { businessId: string } }
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

    return NextResponse.json({ business });
  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business' },
      { status: 500 }
    );
  }
}
