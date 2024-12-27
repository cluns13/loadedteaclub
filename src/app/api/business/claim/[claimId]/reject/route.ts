import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import type { BusinessClaim } from '@/types/models';
import { deleteS3Objects, getS3KeyFromUrl } from '@/lib/s3/s3';
import { sendClaimRejectedEmail } from '@/lib/email/email';
import { z } from 'zod';

const rejectSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
});

export async function POST(
  request: Request,
  { params }: { params: { claimId: string } }
) {
  try {
    // Get user from session and verify admin status
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'You must be an admin to reject claims' },
        { status: 401 }
      );
    }

    const { claimId } = params;
    if (!ObjectId.isValid(claimId)) {
      return NextResponse.json(
        { error: 'Invalid claim ID' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const result = rejectSchema.safeParse(body);
    
    if (!result.success) {
      const errorMessage = result.error.issues
        .map(issue => issue.message)
        .join(', ');
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { reason } = result.data;

    const db = await getDb();
    
    // Find the claim
    const claim = await db.collection<BusinessClaim>('businessClaims').findOne({
      _id: new ObjectId(claimId)
    });

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    if (claim.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending claims can be rejected' },
        { status: 400 }
      );
    }

    // Get business name and user email for notification
    const [business, user] = await Promise.all([
      db.collection('businesses').findOne({ _id: new ObjectId(claim.businessId) }),
      db.collection('users').findOne({ _id: new ObjectId(claim.userId) })
    ]);

    if (!business || !user) {
      return NextResponse.json(
        { error: 'Associated business or user not found' },
        { status: 404 }
      );
    }

    // Update claim status
    const now = new Date();
    await db.collection<BusinessClaim>('businessClaims').updateOne(
      { _id: new ObjectId(claimId) },
      { 
        $set: { 
          status: 'REJECTED',
          rejectionReason: reason,
          rejectedBy: new ObjectId(session.user.id),
          rejectedAt: now,
          updatedAt: now
        }
      }
    );

    // Delete uploaded files
    const s3Keys = claim.verificationDocuments
      .map(url => getS3KeyFromUrl(url))
      .filter((key): key is string => key !== null);

    if (s3Keys.length > 0) {
      const deleteResults = await deleteS3Objects(s3Keys);
      const failedDeletions = deleteResults.filter(r => !r.success);
      
      if (failedDeletions.length > 0) {
        console.error('Failed to delete some S3 objects:', failedDeletions);
      }
    }

    // Send rejection email to user
    await sendClaimRejectedEmail(
      { ...claim, status: 'REJECTED', updatedAt: now, rejectionReason: reason },
      business.name,
      user.email,
      reason
    );

    return NextResponse.json({ 
      message: 'Claim rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting business claim:', error);
    return NextResponse.json(
      { error: 'Failed to reject business claim' },
      { status: 500 }
    );
  }
}
