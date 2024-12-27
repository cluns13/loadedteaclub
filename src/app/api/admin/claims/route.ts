import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { ClaimService } from '@/lib/services/claimService';
import { z } from 'zod';
import { sendClaimStatusEmail } from '@/lib/email/email';

// Verify admin role
async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session?.user?.role !== 'ADMIN') {
    return false;
  }
  return session.user.id;
}

// GET /api/admin/claims - List claims with optional filters
export async function GET(request: Request) {
  // Verify admin access
  const adminId = await verifyAdmin();
  if (!adminId) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'approved' | 'rejected' | undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');

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

// Schema for review action
const reviewSchema = z.object({
  claimId: z.string().min(1, 'Claim ID is required'),
  action: z.enum(['approve', 'reject'], {
    invalid_type_error: 'Invalid action'
  }),
  reviewNotes: z.string().optional(),
});

// POST /api/admin/claims - Review a claim
export async function POST(request: Request) {
  // Verify admin access
  const adminId = await verifyAdmin();
  if (!adminId) {
    return NextResponse.json(
      { error: 'Unauthorized access' },
      { status: 401 }
    );
  }

  try {
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

    // Update claim status
    try {
      await ClaimService.updateClaimStatus(
        claimId,
        action === 'approve' ? 'approved' : 'rejected',
        adminId,
        reviewNotes
      );

      // Send email notification
      const emailSent = await sendClaimStatusEmail({
        to: claim.claimant.email,
        businessName: claim.business.name,
        status: action === 'approve' ? 'approved' : 'rejected',
        notes: reviewNotes
      });

      if (!emailSent) {
        console.error('Failed to send claim status email');
        // Don't fail the request, but include warning in response
        return NextResponse.json({
          success: true,
          warning: 'Claim updated but notification email failed to send'
        });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error updating claim:', error);
      return NextResponse.json(
        { error: 'Failed to update claim status' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error reviewing claim:', error);
    return NextResponse.json(
      { error: 'Failed to process claim review' },
      { status: 500 }
    );
  }
}
