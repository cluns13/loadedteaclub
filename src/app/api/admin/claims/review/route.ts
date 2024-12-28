import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { ClaimService } from '@/lib/services/claimService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { VerificationStep, VerificationMethod } from '@/types/claims';

// Validation schema for verification step
const verificationStepSchema = z.object({
  claimId: z.string(),
  method: z.enum(['documents', 'ownership', 'location', 'phone', 'email', 'mail', 'menu', 'ownership_verification']),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  details: z.string().optional(),
  reviewedBy: z.string().optional(),
  value: z.union([z.string(), z.boolean(), z.number(), z.null()]).optional()
});

export async function POST(req: NextRequest) {
  try {
    // Validate user session and role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = verificationStepSchema.parse(body);

    // Prepare verification step data
    const verificationStep: VerificationStep = {
      method: validatedData.method as VerificationMethod,
      status: validatedData.status,
      details: validatedData.details,
      completedAt: new Date(),
      assignedTo: validatedData.reviewedBy ? ObjectId.createFromHexString(validatedData.reviewedBy) : undefined,
      value: validatedData.value ?? null
    };

    // Update claim verification step
    const result = await ClaimService.updateClaimVerificationStep(
      validatedData.claimId, 
      verificationStep
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Claim verification step error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
