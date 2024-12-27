import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { ClaimService } from '@/lib/services/claimService';
import { BusinessService } from '@/lib/db/services/businessService';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const reviewSchema = z.object({
  claimId: z.string().min(1, 'Claim ID is required'),
  action: z.enum(['approve', 'reject'], {
    invalid_type_error: 'Invalid review action'
  }),
  reviewNotes: z.string().optional()
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
    const result = reviewSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );
    }

    const { claimId, action, reviewNotes } = result.data;
    
    // Retrieve the claim details
    const claim = await ClaimService.getClaimById(claimId);
    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Update claim status
    const updatedClaim = await ClaimService.updateClaimStatus(
      claimId, 
      action === 'approve' ? 'approved' : 'rejected', 
      session.user.id,
      reviewNotes
    );

    // If approved, update the business to mark as claimed
    if (action === 'approve') {
      await BusinessService.update(
        claim.businessId.toString(), 
        { 
          isClaimed: true,
          claimedBy: new ObjectId(claim.userId),
          claimedAt: new Date() 
        }
      );
    }

    // TODO: Send email notification to business owner about claim status

    return NextResponse.json({ 
      success: true, 
      claim: updatedClaim,
      warning: action === 'approve' ? checkBusinessIntegrity(claim) : undefined
    });
  } catch (error) {
    console.error('Error reviewing claim:', error);
    return NextResponse.json(
      { 
        error: 'Failed to review claim', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Helper function to check business data integrity after claim
function checkBusinessIntegrity(claim) {
  const warnings = [];

  // Check for missing essential business information
  const essentialFields = [
    'contact.phone', 
    'contact.email', 
    'hours', 
    'menu'
  ];

  essentialFields.forEach(field => {
    if (!claim.business[field]) {
      warnings.push(`Missing ${field} information`);
    }
  });

  return warnings.length > 0 
    ? `Business claim approved with potential data gaps: ${warnings.join(', ')}`
    : null;
}
