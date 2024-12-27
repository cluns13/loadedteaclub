import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import type { BusinessClaim } from '@/types/models';
import { z } from 'zod';

// Only allow test mode in development
const isTestMode = process.env.NODE_ENV === 'development';

const claimSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  businessLicense: z.string().min(1, 'Business license is required')
    .regex(/^test\/[\w-]+\.(jpg|jpeg|png|pdf)$/, 'Invalid document format or path'),
  proofOfOwnership: z.string().min(1, 'Proof of ownership is required')
    .regex(/^test\/[\w-]+\.(jpg|jpeg|png|pdf)$/, 'Invalid document format or path'),
  governmentId: z.string().min(1, 'Government ID is required')
    .regex(/^test\/[\w-]+\.(jpg|jpeg|png|pdf)$/, 'Invalid document format or path'),
  utilityBill: z.string().nullable()
    .transform(val => val || null)
    .refine(val => val === null || /^test\/[\w-]+\.(jpg|jpeg|png|pdf)$/.test(val), 'Invalid document format or path'),
  additionalNotes: z.string().optional(),
});

export async function POST(request: Request) {
  if (!isTestMode) {
    return NextResponse.json(
      { error: 'Test endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
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

    // For test mode, we'll use a fixed test user ID
    const testUserId = new ObjectId('000000000000000000000001');

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

    // Create the claim
    const claimId = new ObjectId();
    const claim: BusinessClaim = {
      _id: claimId,
      id: claimId.toString(),
      businessId: new ObjectId(businessId),
      userId: testUserId,
      status: 'PENDING',
      verificationDocuments: [businessLicense, proofOfOwnership, governmentId],
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentStatus: 'PENDING',
      paymentAmount: 0,
      subscriptionEndDate: new Date(),
    };

    const result2 = await db.collection<BusinessClaim>('businessClaims').insertOne(claim);

    // Update business to mark it as having a pending claim
    await db.collection('businesses').updateOne(
      { _id: new ObjectId(businessId) },
      { 
        $set: { 
          hasPendingClaim: true,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      claimId: result2.insertedId,
      message: 'Claim submitted successfully'
    });

  } catch (error) {
    console.error('Error in test claim endpoint:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your claim' },
      { status: 500 }
    );
  }
}
