import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import type { BusinessClaim } from '@/types/models';
import { deleteS3Objects, getS3KeyFromUrl } from '@/lib/s3/s3';
import { sendClaimCancelledEmail } from '@/lib/email/email';

export async function POST(
  request: Request,
  { params }: { params: { claimId: string } }
) {
  try {
    // Get user from session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be logged in to cancel a claim' },
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

    const db = await getDb();
    
    // Find the claim
    const claim = await db.collection<BusinessClaim>('businessClaims').findOne({
      _id: new ObjectId(claimId),
      userId: new ObjectId(session.user.id)
    });

    if (!claim) {
      return NextResponse.json(
        { error: 'Claim not found or unauthorized' },
        { status: 404 }
      );
    }

    if (claim.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending claims can be cancelled' },
        { status: 400 }
      );
    }

    // Get business name for email
    const business = await db.collection('businesses').findOne({
      _id: new ObjectId(claim.businessId)
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Associated business not found' },
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

    // Send cancellation email
    await sendClaimCancelledEmail(
      { ...claim, updatedAt: now },
      business.name,
      session.user.email!
    );

    return NextResponse.json({ 
      message: 'Claim cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling business claim:', error);
    return NextResponse.json(
      { error: 'Failed to cancel business claim' },
      { status: 500 }
    );
  }
}
