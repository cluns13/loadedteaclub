import { NextResponse } from 'next/server';
import { ClaimService } from '@/lib/services/claimService';
import { z } from 'zod';
import { sendClaimStatusEmail } from '@/lib/email/email';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';

// Only allow test mode in development
const isTestMode = process.env.NODE_ENV === 'development';

// Helper function to create a test user for claims
const createTestUser = async () => {
  const db = await getDb();
  const testUser = {
    _id: new ObjectId('000000000000000000000001'),
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
  };

  await db.collection('users').updateOne(
    { _id: testUser._id },
    { $set: testUser },
    { upsert: true }
  );

  return testUser;
};

// Schema for review action
const reviewSchema = z.object({
  claimId: z.string().min(1, 'Claim ID is required'),
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: 'Invalid action' })
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

    let claims;
    if (status) {
      claims = await ClaimService.getClaimsByStatus(status);
    } else {
      claims = await ClaimService.getRecentClaims(limit);
    }

    // Get detailed information for each claim
    const claimsWithDetails = await Promise.all(
      claims.map(claim => ClaimService.getClaimWithDetails(claim._id!.toString()))
    );

    return NextResponse.json({
      claims: claimsWithDetails.filter(Boolean),
      total: await ClaimService.getPendingClaimsCount(),
    });

  } catch (error) {
    console.error('Error fetching claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch claims' },
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
    // Ensure test user exists
    await createTestUser();

    // Validate request body
    const body = await request.json();
    const result = reviewSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { claimId, action, reviewNotes } = result.data;

    // Get claim details
    const claim = await ClaimService.getClaimWithDetails(claimId);
    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Use test admin ID
    const testAdminId = '000000000000000000000002';

    // Update claim status
    await ClaimService.updateClaimStatus(
      claimId,
      action === 'approve' ? 'approved' : 'rejected',
      testAdminId,
      reviewNotes
    );

    // Send email notification to the claimant
    if (claim.claimant?.email) {
      await sendClaimStatusEmail({
        to: claim.claimant.email,
        businessName: claim.business.name,
        status: action === 'approve' ? 'approved' : 'rejected',
        notes: reviewNotes,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Claim ${action}d successfully`,
    });

  } catch (error) {
    console.error('Error reviewing claim:', error);
    return NextResponse.json(
      { error: 'Failed to process claim review' },
      { status: 500 }
    );
  }
}
