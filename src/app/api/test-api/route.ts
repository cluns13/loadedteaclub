import { NextResponse } from 'next/server';
import { ClaimService } from '@/lib/services/claimService';
import { VerificationService } from '@/lib/services/verificationService';
import { z } from 'zod';

// Only allow test mode in development
const isTestMode = process.env.NODE_ENV === 'development';

// Schema for review action
const reviewSchema = z.object({
  claimId: z.string().min(1, 'Claim ID is required'),
  reviewAction: z.enum(['approve', 'reject'], {
    errorMap: () => ({ message: 'Invalid action' })
  }),
  reviewNotes: z.string().optional(),
});

// Schema for verification action
const verificationSchema = z.object({
  claimId: z.string().min(1, 'Claim ID is required'),
  method: z.enum(['phone', 'email', 'mail', 'documents'], {
    errorMap: () => ({ message: 'Invalid verification method' })
  }),
});

// GET /api/test-api - Handle various test actions
export async function GET(request: Request) {
  if (!isTestMode) {
    return NextResponse.json(
      { error: 'Test endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'listClaims': {
        const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | undefined;
        const limit = parseInt(searchParams.get('limit') || '10');

        let claims;
        if (status) {
          claims = await ClaimService.getClaimsByStatus(status);
        } else {
          claims = await ClaimService.getRecentClaims(limit);
        }

        const claimsWithDetails = await Promise.all(
          claims.map(claim => ClaimService.getClaimWithDetails(claim._id!.toString()))
        );

        return NextResponse.json({
          claims: claimsWithDetails,
          total: await ClaimService.getPendingClaimsCount(),
        });
      }

      case 'verificationStatus': {
        const claimId = searchParams.get('claimId');
        if (!claimId) {
          return NextResponse.json(
            { error: 'Claim ID is required' },
            { status: 400 }
          );
        }

        const status = await VerificationService.getVerificationStatus(claimId);
        return NextResponse.json({ status });
      }

      case 'ping':
        return NextResponse.json({ message: 'pong' });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error handling test request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// POST /api/test-api - Handle various test actions
export async function POST(request: Request) {
  if (!isTestMode) {
    return NextResponse.json(
      { error: 'Test endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const action = body.action;

    switch (action) {
      case 'reviewClaim': {
        const result = reviewSchema.safeParse(body);
        if (!result.success) {
          return NextResponse.json(
            { error: result.error.issues.map(i => i.message).join(', ') },
            { status: 400 }
          );
        }

        const { claimId, reviewAction, reviewNotes } = result.data;

        const updatedClaim = await ClaimService.updateClaimStatus(
          claimId, 
          reviewAction === 'approve' ? 'approved' : 'rejected',
          reviewNotes
        );

        return NextResponse.json({
          message: `Claim ${reviewAction}d successfully`,
          claim: updatedClaim
        });
      }

      case 'verifyStep': {
        const result = verificationSchema.safeParse(body);
        if (!result.success) {
          return NextResponse.json(
            { error: result.error.issues.map(i => i.message).join(', ') },
            { status: 400 }
          );
        }

        const { claimId, method } = result.data;

        const verificationStep = {
          method,
          status: 'pending' as const,
          details: `Verified via ${method} method`,
          completedAt: new Date()
        };

        const updateResult = await ClaimService.updateClaimVerificationStep(
          claimId, 
          verificationStep
        );

        return NextResponse.json({
          message: 'Verification step updated successfully',
          claim: updateResult.data
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error handling test request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
