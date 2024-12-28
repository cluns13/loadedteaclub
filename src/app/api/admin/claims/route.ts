import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { ClaimService } from '@/lib/services/claimService';
import { z } from 'zod';
import { sendClaimStatusEmail } from '@/lib/email/email';
import { getMongoDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { BusinessClaim } from '@/types/claims';

// Extend the session type to include role
type AdminSession = {
  user: {
    id: string;
    role: 'ADMIN' | 'USER' | 'BUSINESS_OWNER';
  }
};

const claimActionSchema = z.object({
  claimId: z.string().min(1, 'Claim ID is required'),
  action: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: 'Invalid action type' })
  }),
  reviewNotes: z.string().optional(),
});

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as AdminSession | null;
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const db = await getMongoDb();
    const claimsCollection = db.collection<BusinessClaim>('businessClaims');

    // Fetch recent claims with pagination
    const claims = await claimsCollection
      .find({ status: 'pending' })
      .limit(10)
      .toArray();

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
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch claims' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as AdminSession | null;
    
    // Ensure user is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { claimId, action, reviewNotes } = claimActionSchema.parse(body);

    const claim = await ClaimService.findClaimById(claimId);
    
    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    const db = await getMongoDb();
    const userCollection = db.collection('users');
    const businessCollection = db.collection('businesses');

    const status = action === 'approve' ? 'approved' : 'rejected';

    // Fetch user and business details for email
    const user = await userCollection.findOne({ _id: new ObjectId(claim.userId.toString()) });
    const business = await businessCollection.findOne({ _id: new ObjectId(claim.businessId.toString()) });

    // Update claim status
    const updatedClaim = await ClaimService.updateClaimStatus(
      claimId, 
      status, 
      reviewNotes, 
      session.user.id
    );

    if (user?.email) {
      await sendClaimStatusEmail({
        to: user.email, 
        businessName: business?.name || 'Your Business', 
        status: action === 'approve' ? 'approved' : 'rejected',
        notes: reviewNotes
      });
    }

    return NextResponse.json({
      success: true,
      message: `Claim ${action}d successfully`,
      claim: updatedClaim
    });

  } catch (error) {
    console.error('Error processing claim:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to process claim' 
    }, { status: 500 });
  }
}
