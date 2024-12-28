import { NextResponse } from 'next/server';
import { ClaimService } from '@/lib/services/claimService';
import { z } from 'zod';
import { sendClaimStatusEmail } from '@/lib/email/email';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';
import { BusinessClaim } from '@/types/claims';

// Only allow test mode in development
const isTestMode = process.env.NODE_ENV === 'development';

// Helper function to create a test user for claims
async function createTestUser() {
  const db = await getDb();
  const userCollection = db.collection('users');
  
  const testUser = await userCollection.findOne({ email: 'test.admin@example.com' });
  if (!testUser) {
    throw new Error('Test admin user not found');
  }
  
  return testUser;
}

// Schema for review action
const reviewSchema = z.object({
  claimId: z.string().min(1, 'Claim ID is required'),
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: 'Invalid action' }),
  }),
  reviewNotes: z.string().optional(),
});

// GET /api/test/admin/claims - List claims with optional filters
export async function GET(request: Request) {
  if (!isTestMode) {
    return NextResponse.json(
      { error: 'Test endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    // Ensure test user exists
    await createTestUser();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | undefined;
    const limit = parseInt(searchParams.get('limit') || '10');

    const db = await getDb();
    const claimsCollection = db.collection<BusinessClaim>('businessClaims');

    let claims: BusinessClaim[];
    if (status) {
      claims = await claimsCollection
        .find({ status })
        .limit(limit)
        .toArray();
    } else {
      claims = await claimsCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
    }

    // Get detailed information for each claim
    const claimsWithDetails = await Promise.all(
      claims.map(async (claim) => {
        const userCollection = db.collection('users');
        const businessCollection = db.collection('businesses');

        const user = await userCollection.findOne({ _id: claim.userId });
        const business = await businessCollection.findOne({ _id: claim.businessId });

        return {
          ...claim,
          user: {
            id: user?._id,
            name: user?.name,
            email: user?.email
          },
          business: {
            id: business?._id,
            name: business?.name
          }
        };
      })
    );

    return NextResponse.json({
      claims: claimsWithDetails,
      total: await claimsCollection.countDocuments({ status: 'pending' })
    });

  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch claims' },
      { status: 500 }
    );
  }
}

// POST /api/test/admin/claims - Review a claim
export async function POST(request: Request) {
  if (!isTestMode) {
    return NextResponse.json(
      { error: 'Test endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const testUser = await createTestUser();
    const db = await getDb();
    const userCollection = db.collection('users');
    const businessCollection = db.collection('businesses');
    const claimsCollection = db.collection<BusinessClaim>('businessClaims');

    // Parse request body
    const body = await request.json();
    const { claimId, action, reviewNotes } = reviewSchema.parse(body);

    // Fetch the claim with additional details
    const claim = await claimsCollection.findOne({ 
      _id: new ObjectId(claimId) 
    });

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // Fetch user and business details
    const claimant = await userCollection.findOne({ 
      _id: claim.userId 
    });

    const business = await businessCollection.findOne({ 
      _id: claim.businessId 
    });

    // Update claim status
    const updatedClaim = await ClaimService.updateClaimStatus(
      claimId, 
      action === 'approve' ? 'approved' : 'rejected',
      reviewNotes,
      testUser._id.toString()
    );

    // Send email notification
    if (claimant?.email) {
      await sendClaimStatusEmail({
        to: claimant.email, 
        businessName: business?.name || 'Your Business', 
        status: action === 'approve' ? 'approved' : 'rejected',
        notes: reviewNotes
      });
    }

    return NextResponse.json({
      message: `Claim ${action}d successfully`,
      claim: updatedClaim
    });

  } catch (error) {
    console.error('Error reviewing claim:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to review claim' },
      { status: 500 }
    );
  }
}
