import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import ClaimService from '@/lib/services/claimService';
import { z } from 'zod';
import { VerificationMethod, BusinessClaim } from '@/types/claims';

// Schema for verification step update
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const claimId = searchParams.get('claimId');

    if (!claimId) {
      return NextResponse.json(
        { error: 'Claim ID is required' },
        { status: 400 }
      );
    }

    const claim = await ClaimService.getClaimById(claimId);
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 401 }
    );
  }

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

    // Add method to ClaimService to update verification step
    const updateResult = await ClaimService.updateVerificationStep(
      claimId,
      {
        method: stepMethod as VerificationMethod,
        status,
        details: notes || '' // Ensure details is always a string
      }
    );

    if (!updateResult.success) {
      return NextResponse.json(
        { error: updateResult.error || 'Failed to update verification step' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
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
