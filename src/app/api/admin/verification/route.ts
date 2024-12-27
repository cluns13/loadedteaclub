import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { ClaimService } from '@/lib/services/claimService';
import { z } from 'zod';

const verificationSchema = z.object({
  claimId: z.string().min(1, 'Claim ID is required'),
  method: z.enum([
    'documents', 
    'ownership_verification', 
    'menu', 
    'phone', 
    'email'
  ], {
    invalid_type_error: 'Invalid verification method'
  }),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed'], {
    invalid_type_error: 'Invalid verification status'
  }),
  notes: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = verificationSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { claimId, method, status, notes } = result.data;
    
    const verificationStep = {
      method,
      status,
      details: notes,
      completedAt: status === 'completed' ? new Date() : undefined,
      assignedTo: session.user.id ? new ObjectId(session.user.id) : undefined
    };

    const updatedClaim = await ClaimService.updateClaimVerificationStep(
      claimId, 
      method, 
      status
    );

    // Automatically update claim status based on verification steps
    const allStepsCompleted = updatedClaim?.verificationSteps.every(
      step => step.status === 'completed'
    );

    if (allStepsCompleted) {
      await ClaimService.updateClaimStatus(
        claimId, 
        'approved', 
        session.user.id
      );
    }

    return NextResponse.json({ 
      success: true, 
      claim: updatedClaim,
      allStepsCompleted
    });
  } catch (error) {
    console.error('Error processing verification:', error);
    return NextResponse.json(
      { error: 'Failed to process verification', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const claimId = searchParams.get('claimId');

    if (!claimId) {
      return NextResponse.json(
        { error: 'Claim ID is required' },
        { status: 400 }
      );
    }

    const status = await ClaimService.getVerificationStatus(claimId);
    return NextResponse.json({ status });
  } catch (error) {
    console.error('Error getting verification status:', error);
    return NextResponse.json(
      { error: 'Failed to get verification status' },
      { status: 500 }
    );
  }
}
