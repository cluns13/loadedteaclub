import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';

type Params = {
  params: {
    claimId: string;
  }
};

type BusinessClaim = {
  id: string;
  userId: string;
  businessId: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  createdAt: Date;
  verificationDocuments: string[];
  updatedAt: Date;
};

const mockBusinessClaims: BusinessClaim[] = [
  {
    id: 'claim-1',
    userId: 'user-1',
    businessId: 'business-1',
    status: 'pending',
    createdAt: new Date(),
    verificationDocuments: [],
    updatedAt: new Date()
  }
];

const mockBusinesses = [
  {
    id: 'business-1',
    name: 'Business 1'
  }
];

export async function POST(
  request: Request,
  { params }: Params
) {
  try {
    // Get user from session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to cancel a claim' },
        { status: 401 }
      );
    }

    const { claimId } = params;

    const claimIndex = mockBusinessClaims.findIndex(
      claim => claim.id === claimId && claim.userId === session.user.id
    );

    if (claimIndex === -1) {
      return NextResponse.json(
        { error: 'Claim not found or unauthorized' },
        { status: 404 }
      );
    }

    const claim = mockBusinessClaims[claimIndex];

    if (claim.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending claims can be cancelled' },
        { status: 400 }
      );
    }

    // Get business name for email
    const business = mockBusinesses.find(b => b.id === claim.businessId);

    if (!business) {
      return NextResponse.json(
        { error: 'Associated business not found' },
        { status: 404 }
      );
    }

    // Update claim status
    const now = new Date();
    mockBusinessClaims[claimIndex] = {
      ...claim,
      status: 'rejected',
      updatedAt: now
    };

    // Delete uploaded files
    const s3Keys = claim.verificationDocuments
      .map(url => url)
      .filter((key): key is string => key !== null);

    if (s3Keys.length > 0) {
      console.log('Mock deleting S3 objects:', s3Keys);
    }

    // Send cancellation email
    console.log('Mock sending claim cancelled email to', session.user.email);

    return NextResponse.json({ 
      message: 'Claim cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling business claim:', error);
    return NextResponse.json(
      { error: 'Failed to cancel business claim' },
      { status: 500 }
    );
  }
}
