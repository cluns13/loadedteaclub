import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { ClaimService } from '@/lib/services/claimService';
import { z } from 'zod';
import type { VerificationMethod } from '@/types/claims';

// Extend the session type to include role
type AdminSession = {
  user: {
    id: string;
    role: 'USER' | 'BUSINESS_OWNER' | 'ADMIN';
    email?: string | null;
    name?: string | null;
    image?: string | null;
    globalCustomerId?: string | null;
    isClubOwner?: boolean;
  };
}

async function requireAdminAccess(session: AdminSession | null): Promise<void> {
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }
}

const verificationSchema = z.object({
  claimId: z.string().min(1, 'Claim ID is required'),
  stepMethod: z.string().min(1, 'Step method is required'),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed'], {
    invalid_type_error: 'Invalid status'
  }),
  notes: z.string().optional(),
  value: z.union([
    z.string(), 
    z.number(), 
    z.boolean(), 
    z.null()
  ]).optional()
});

// GET /api/admin/verification - Get verification steps for a claim
export async function GET(request: Request) {
  const session = await getServerSession(authOptions) as AdminSession | null;
  await requireAdminAccess(session);

  try {
    const { searchParams } = new URL(request.url);
    const claimId = searchParams.get('claimId');

    if (!claimId) {
      return NextResponse.json(
        { error: 'Claim ID is required' },
        { status: 400 }
      );
    }

    const claim = await ClaimService.findClaimById(claimId);
    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      verificationSteps: claim.verificationSteps || []
    });

  } catch (error) {
    console.error('Error fetching verification steps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification steps' },
      { status: 500 }
    );
  }
}

// POST /api/admin/verification - Update verification step
export async function POST(request: Request) {
  const session = await getServerSession(authOptions) as AdminSession | null;
  await requireAdminAccess(session);

  try {
    const body = await request.json();
    const result = verificationSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { claimId, stepMethod, status, notes } = result.data;

    const updateResult = await ClaimService.updateVerificationStep(
      claimId, 
      {
        method: stepMethod as VerificationMethod,
        status,
        details: notes || ''
      }
    );

    if (!updateResult.success) {
      return NextResponse.json(
        { error: updateResult.error || 'Failed to update verification step' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Verification step updated successfully',
      claim: updateResult.data
    });

  } catch (error) {
    console.error('Error updating verification step:', error);
    return NextResponse.json(
      { error: 'Failed to update verification step' },
      { status: 500 }
    );
  }
}
