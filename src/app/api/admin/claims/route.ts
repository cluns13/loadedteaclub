import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import ClaimService from '@/lib/services/claimService';
import { ClaimStatus, VerificationStatus } from '@/types/claims';
import { User } from '@/types/models';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

// Validation schema for claim update
const claimUpdateSchema = z.object({
  claimId: z.string(),
  status: z.enum(['pending', 'approved', 'rejected']),
  reviewedBy: z.string().optional(),
  reviewNotes: z.string().optional(),
  verificationStatus: z.array(z.enum(['documents', 'ownership', 'location'])).optional()
});

// Validate admin access
async function requireAdminAccess(session: { user: Pick<User, 'id' | 'role'> } | null): Promise<Pick<User, 'id' | 'role'>> {
  if (!session || session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  return session.user;
}

// GET /api/admin/claims
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminUser = await requireAdminAccess(session as { user: Pick<User, 'id' | 'role'> } | null);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as ClaimStatus | null;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    // Validate pagination parameters
    if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' }, 
        { status: 400 }
      );
    }

    const claims = status 
      ? await ClaimService.getClaimsByStatus(status, limit, page)
      : await ClaimService.getRecentClaims(limit, page);

    const total = await ClaimService.getPendingClaimsCount();

    return NextResponse.json({
      claims,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('Claims retrieval error:', error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to retrieve claims';

    return NextResponse.json(
      { error: errorMessage }, 
      { status: errorMessage === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// POST /api/admin/claims
export async function POST(req: NextRequest) {
  try {
    // Validate user session and role
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Parse request body
    const body = await req.json();
    const validatedData = claimUpdateSchema.parse(body);

    // Prepare claim update data
    const updateData: ClaimStatus = {
      status: validatedData.status,
      reviewedBy: validatedData.reviewedBy ? new ObjectId(validatedData.reviewedBy) : undefined,
      reviewNotes: validatedData.reviewNotes,
      verificationStatus: validatedData.verificationStatus || []
    };

    // Update claim
    const result = await ClaimService.updateClaimStatus(
      validatedData.claimId, 
      updateData
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    console.error('Claim update error:', error);
    
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
