import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import type { BusinessClaim } from '@/types/models';
import { z } from 'zod';
import { sendClaimSubmittedEmail, sendAdminNotificationEmail } from '@/lib/email/email';
import { businessClaimRateLimit } from '@/lib/rateLimit';

const claimSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  businessLicense: z.string().min(1, 'Business license is required'),
  proofOfOwnership: z.string().min(1, 'Proof of ownership is required'),
  governmentId: z.string().min(1, 'Government ID is required'),
  utilityBill: z.string().nullable(),
  additionalNotes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Get user from session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to claim a business' },
        { status: 401 }
      );
    }

    // Apply rate limiting based on user ID
    const rateLimitResult = await businessClaimRateLimit.check(session.user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many business claim attempts. Please try again later.',
          resetTime: rateLimitResult.resetTime,
          remaining: rateLimitResult.remaining
        }, 
        { status: 429 } // Too Many Requests
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const result = claimSchema.safeParse(body);
    
    if (!result.success) {
      const errorMessage = result.error.issues
        .map(issue => issue.message)
        .join(', ');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { 
      businessId,
      businessLicense,
      proofOfOwnership,
      governmentId,
      utilityBill,
      additionalNotes = ''
    } = result.data;

    const db = await getDb();
    
    // Check if business exists
    const business = await db.collection('businesses').findOne({
      _id: new ObjectId(businessId)
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Check if business is already claimed
    if (business.claimed) {
      return NextResponse.json(
        { error: 'This business has already been claimed' },
        { status: 400 }
      );
    }

    // Check if user has any pending claims
    const userPendingClaims = await db.collection<BusinessClaim>('businessClaims').findOne({
      userId: new ObjectId(session.user.id),
      status: 'PENDING'
    });

    if (userPendingClaims) {
      return NextResponse.json(
        { error: 'You already have a pending claim' },
        { status: 400 }
      );
    }

    // Check if there's already a pending claim for this business
    const existingClaim = await db.collection<BusinessClaim>('businessClaims').findOne({
      businessId: new ObjectId(businessId),
      status: 'PENDING'
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: 'There is already a pending claim for this business' },
        { status: 400 }
      );
    }

    // Collect all uploaded document URLs
    const documents = [
      businessLicense,
      proofOfOwnership,
      governmentId,
      ...(utilityBill ? [utilityBill] : [])
    ];

    // Create claim request
    const claim: Omit<BusinessClaim, '_id'> = {
      id: new ObjectId().toString(),
      businessId: new ObjectId(businessId),
      userId: new ObjectId(session.user.id),
      status: 'PENDING',
      verificationDocuments: documents,
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentStatus: 'PENDING',
      paymentAmount: 0,
      subscriptionEndDate: new Date()
    };

    const insertResult = await db.collection<BusinessClaim>('businessClaims').insertOne({
      ...claim,
      _id: new ObjectId()
    });
    const insertedClaim = { ...claim, _id: insertResult.insertedId };

    // Send notification emails
    await Promise.all([
      sendClaimSubmittedEmail(insertedClaim as BusinessClaim, business.name, session.user.email!),
      sendAdminNotificationEmail(insertedClaim as BusinessClaim, business.name, session.user.name!)
    ]);

    return NextResponse.json({ 
      message: 'Claim submitted successfully',
      status: 'pending',
      claimId: insertResult.insertedId.toString()
    });
  } catch (error) {
    console.error('Error processing business claim:', error);
    return NextResponse.json(
      { error: 'Failed to process business claim' },
      { status: 500 }
    );
  }
}
