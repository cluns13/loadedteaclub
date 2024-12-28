  import { ObjectId } from 'mongodb';
import { getMongoDb } from '@/lib/db/mongodb';
import { z } from 'zod';
import { WithId } from '@/types/database';
import { 
  BusinessClaim, 
  ClaimDocuments, 
  ClaimStatus, 
  VerificationStatus, 
  VerificationStep,
  ClaimWithDetails,
  VerificationMethod
} from '@/types/claims';
import { sendClaimStatusEmail } from '@/lib/email/email';

// Comprehensive input validation schema
export const ClaimInputSchema = z.object({
  businessName: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name cannot exceed 100 characters')
    .trim(),
  businessId: z.string(),
  userId: z.string(),
  userEmail: z.string().email().optional(),
  businessEmail: z.string().email().optional(),
  documents: z.object({
    businessLicense: z.string().optional(),
    proofOfOwnership: z.string().optional(),
    governmentId: z.string().optional(),
    utilityBill: z.string().optional(),
    taxDocument: z.string().optional(),
    additionalDocuments: z.array(z.string()).optional()
  }).optional()
}).strict();

// Service result type for enhanced error handling
export type ServiceResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
};

export class ClaimService {
  static readonly COLLECTION = 'businessClaims';

  static async createClaim(
    claimData: z.infer<typeof ClaimInputSchema>
  ): Promise<ServiceResult<WithId<BusinessClaim>>> {
    const db = await getMongoDb();
    try {
      const newClaim: Omit<BusinessClaim, '_id'> = {
        businessName: claimData.businessName,
        businessId: new ObjectId(claimData.businessId),
        userId: new ObjectId(claimData.userId),
        userEmail: claimData.userEmail,
        businessEmail: claimData.businessEmail,
        documents: claimData.documents ? {
          businessLicense: claimData.documents.businessLicense || undefined,
          proofOfOwnership: claimData.documents.proofOfOwnership || undefined,
          governmentId: claimData.documents.governmentId || undefined,
          utilityBill: claimData.documents.utilityBill || undefined,
          taxDocument: claimData.documents.taxDocument || undefined,
          additionalDocuments: claimData.documents.additionalDocuments || undefined
        } : undefined,
        status: 'pending',
        verificationStatus: ['pending'] as VerificationStatus[],
        estimatedReviewTime: 48,  // Default 48 hours
        priority: 'standard',
        verificationSteps: [],
        reviewedAt: undefined,
        reviewedBy: undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await db.collection<BusinessClaim>(ClaimService.COLLECTION)
        .insertOne(newClaim);

      const claim = { 
        ...newClaim, 
        _id: result.insertedId 
      } as WithId<BusinessClaim>;

      return { 
        success: true, 
        data: claim 
      };
    } catch (error) {
      console.error('Error creating claim:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorCode: 'CLAIM_CREATE_FAILED'
      };
    }
  }

  static async updateClaimStatus(
    claimId: string, 
    status: ClaimStatus, 
    reviewNotes?: string,
    reviewedBy?: string
  ): Promise<WithId<BusinessClaim> | null> {
    const db = await getMongoDb();
    const claimCollection = db.collection<BusinessClaim>(ClaimService.COLLECTION);
    const userCollection = db.collection('users');
    const businessCollection = db.collection('businesses');

    const result = await claimCollection.findOneAndUpdate(
      { _id: new ObjectId(claimId) },
      { 
        $set: { 
          status, 
          reviewNotes: reviewNotes || undefined, 
          reviewedBy: reviewedBy ? new ObjectId(reviewedBy) : undefined,
          reviewedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );

    // Fetch additional details for email notification
    if (result) {
      const claimant = await userCollection.findOne({ _id: new ObjectId(result.userId.toString()) });
      const business = await businessCollection.findOne({ _id: new ObjectId(result.businessId.toString()) });

      if (claimant?.email) {
        await sendClaimStatusEmail({
          to: claimant.email,
          businessName: business?.name || 'Your Business',
          status: status.toLowerCase() === 'approved' ? 'approved' : 'rejected',
          notes: reviewNotes
        });
      }
    }

    return result ? { ...result, _id: result._id } : null;
  }

  static async updateVerificationStep(
    claimId: string, 
    stepData: {
      method: VerificationMethod;
      status: 'pending' | 'in_progress' | 'completed' | 'failed';
      details?: string;
    }
  ): Promise<ServiceResult<WithId<BusinessClaim>>> {
    const db = await getMongoDb();
    try {
      const claim = await db.collection<BusinessClaim>(ClaimService.COLLECTION)
        .findOne({ _id: new ObjectId(claimId) });
      if (!claim) {
        return { 
          success: false, 
          error: 'Claim not found' 
        };
      }

      // Update or add the verification step
      const updatedVerificationSteps: VerificationStep[] = claim.verificationSteps?.map(step => 
        step.method === stepData.method 
          ? { 
              method: step.method,
              status: stepData.status,
              details: stepData.details || step.details || ''
            }
          : step
      ) || [];

      // If no existing step found, add a new one
      if (!updatedVerificationSteps.some(step => step.method === stepData.method)) {
        updatedVerificationSteps.push({
          method: stepData.method,
          status: stepData.status,
          details: stepData.details || ''
        });
      }

      const updateResult = await db.collection<BusinessClaim>(ClaimService.COLLECTION)
        .findOneAndUpdate(
          { _id: new ObjectId(claimId) },
          { 
            $set: { 
              verificationSteps: updatedVerificationSteps,
              verificationStatus: ['pending'] as VerificationStatus[]
            } 
          },
          { returnDocument: 'after' }
        );

      return updateResult ? {
        success: true,
        data: { ...updateResult, _id: updateResult._id } as WithId<BusinessClaim>
      } : {
        success: false,
        error: 'Failed to update verification step'
      };
    } catch (error) {
      console.error('Error updating verification step:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorCode: 'VERIFICATION_STEP_UPDATE_FAILED'
      };
    }
  }

  static async getAllClaims(): Promise<WithId<BusinessClaim>[]> {
    const db = await getMongoDb();
    const claims = await db.collection<BusinessClaim>(ClaimService.COLLECTION)
      .find({})
      .toArray();
    return claims.map(claim => ({
      ...claim,
      _id: claim._id as ObjectId
    }));
  }

  static async findClaimById(
    claimId: string
  ): Promise<WithId<BusinessClaim> | null> {
    const db = await getMongoDb();
    return await db.collection<BusinessClaim>(ClaimService.COLLECTION)
      .findOne({ _id: new ObjectId(claimId) });
  }

  static async getClaimWithDetails(
    claimId: string, 
    includeDocuments = false
  ): Promise<ClaimWithDetails | null> {
    const db = await getMongoDb();
    const claimCollection = db.collection<BusinessClaim>(ClaimService.COLLECTION);
    const userCollection = db.collection('users');
    const businessCollection = db.collection('businesses');

    const claim = await claimCollection.findOne({ _id: new ObjectId(claimId) });
    if (!claim) return null;

    const claimant = await userCollection.findOne({ _id: new ObjectId(claim.userId.toString()) });
    const business = await businessCollection.findOne({ _id: new ObjectId(claim.businessId.toString()) });

    return {
      _id: claim._id,
      business: {
        _id: business?._id.toString() || '',
        name: business?.name || '',
        address: business?.address || '',
        city: business?.city || '',
        state: business?.state || ''
      },
      claimant: {
        _id: claimant?._id.toString() || '',
        name: claimant?.name || '',
        email: claimant?.email || ''
      },
      status: claim.status,
      verificationSteps: claim.verificationSteps || [],
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt
    };
  }

  static async findClaimsByUserId(
    userId: string
  ): Promise<WithId<BusinessClaim>[]> {
    const db = await getMongoDb();
    return await db.collection<BusinessClaim>(ClaimService.COLLECTION)
      .find({ userId: new ObjectId(userId) })
      .toArray();
  }

  static async updateClaimVerificationStep(
    claimId: string, 
    verificationStep: VerificationStep
  ): Promise<ServiceResult<WithId<BusinessClaim>>> {
    const db = await getMongoDb();
    const collection = db.collection<BusinessClaim>(ClaimService.COLLECTION);

    try {
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(claimId) },
        { 
          $set: { 
            [`verificationSteps.${verificationStep.step}`]: verificationStep,
            updatedAt: new Date()
          } 
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        return { 
          success: false, 
          error: 'Claim not found' 
        };
      }

      return { 
        success: true, 
        data: result as WithId<BusinessClaim>
      };
    } catch (error) {
      console.error('Claim verification step update error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  static async getClaimsByStatus(
    status: ClaimStatus, 
    limit: number = 10, 
    page: number = 1
  ): Promise<WithId<BusinessClaim>[]> {
    const db = await getMongoDb();
    const collection = db.collection<BusinessClaim>(ClaimService.COLLECTION);
    
    return collection
      .find({ status })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .toArray() as Promise<WithId<BusinessClaim>[]>;
  }

  static async getRecentClaims(
    limit: number = 10, 
    page: number = 1
  ): Promise<WithId<BusinessClaim>[]> {
    const db = await getMongoDb();
    const collection = db.collection<BusinessClaim>(ClaimService.COLLECTION);
    
    return collection
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .toArray() as Promise<WithId<BusinessClaim>[]>;
  }

  static async getPendingClaimsCount(): Promise<number> {
    const db = await getMongoDb();
    const collection = db.collection<BusinessClaim>(ClaimService.COLLECTION);
    
    return collection.countDocuments({ status: 'pending' });
  }
}
