import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { z } from 'zod';

const BusinessClaimSchema = z.object({
  id: z.string().optional(),
  businessId: z.string(),
  claimant: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  verificationDocuments: z.record(z.string()).optional(),
  paymentStatus: z.enum(['unpaid', 'paid']).optional(),
  paymentAmount: z.number().optional(),
  subscriptionEndDate: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  priority: z.enum(['standard', 'urgent']).optional(),
});

type BusinessClaim = {
  id: string;
  userId: string;
  businessId: string;
  claimant: {
    name: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  verificationDocuments: { [key: string]: string };
  paymentStatus: 'unpaid' | 'paid';
  paymentAmount: number;
  subscriptionEndDate: Date;
  createdAt: Date;
  priority: 'standard' | 'urgent';
};

const mockBusinessClaims: BusinessClaim[] = [];
const mockBusinesses = [
  { _id: 'business-1', name: 'Business 1', claimed: false },
  { _id: 'business-2', name: 'Business 2', claimed: false },
];

const convertBusinessClaim = (claim: BusinessClaim): BusinessClaim => {
  return {
    ...claim,
    id: claim.id || `claim-${Date.now()}`,
    status: claim.status || 'pending',
    verificationDocuments: claim.verificationDocuments || {},
    paymentStatus: claim.paymentStatus || 'unpaid',
    paymentAmount: claim.paymentAmount || 0,
    subscriptionEndDate: claim.subscriptionEndDate || new Date(),
  };
};

const handleError = (issue: unknown) => {
  console.error('Claim submission error:', issue);
  return NextResponse.json({ error: 'Claim submission failed' }, { status: 500 });
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to claim a business' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = BusinessClaimSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid claim data', details: result.error.errors },
        { status: 400 }
      );
    }

    const claimData = result.data;

    // Check if business exists
    const business = mockBusinesses.find(
      (business) => business._id === claimData.businessId
    );

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
    const userPendingClaims = mockBusinessClaims.find(
      (claim) => claim.userId === session.user.id && claim.status === 'pending'
    );

    if (userPendingClaims) {
      return NextResponse.json(
        { error: 'You already have a pending claim' },
        { status: 400 }
      );
    }

    // Check if there's already a pending claim for this business
    const existingClaim = mockBusinessClaims.find(
      (claim) => claim.businessId === claimData.businessId && claim.status === 'pending'
    );

    if (existingClaim) {
      return NextResponse.json(
        { error: 'There is already a pending claim for this business' },
        { status: 400 }
      );
    }

    // Create a new business claim
    const newClaim: BusinessClaim = {
      id: `claim-${Date.now()}`,
      userId: session.user.id,
      businessId: claimData.businessId,
      claimant: claimData.claimant,
      status: 'pending',
      verificationDocuments: claimData.verificationDocuments || {},
      paymentStatus: 'unpaid',
      paymentAmount: 0,
      subscriptionEndDate: new Date(),
      createdAt: new Date(),
      priority: 'standard'
    };

    mockBusinessClaims.push(newClaim);

    return NextResponse.json({
      success: true,
      claim: convertBusinessClaim(newClaim),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }

    return handleError(error);
  }
}
