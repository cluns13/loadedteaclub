  import { ObjectId } from 'mongodb';
import { getMongoDb } from '@/lib/db/mongodb';
import { z } from 'zod';
import { 
  BusinessClaim, 
  ClaimStatus, 
  VerificationMethod,
  VerificationStep,
  VerificationStatus
} from '@/types/claims';
import { User, LoadedTeaClub } from '@/types/models';
import { sendClaimStatusEmail } from '@/lib/email/email';
import { EventEmitter } from 'events';

// Explicitly define WithId type
type WithId<T> = T & { _id: ObjectId };

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

// Enhanced error handling type
interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
}

// Claim service events
interface ClaimServiceEvents {
  'claim:created': (claim: WithId<BusinessClaim>) => void;
  'claim:updated': (claim: WithId<BusinessClaim>) => void;
  'claim:status-changed': (claim: WithId<BusinessClaim>) => void;
  'claim:verification-updated': (claim: WithId<BusinessClaim>) => void;
}

class ClaimService extends EventEmitter {
  private static readonly COLLECTION = 'businessClaims';
  private static instance: ClaimService;

  private constructor() {
    super();
    // Bind methods to ensure correct 'this' context
    this.on = this.on.bind(this);
    this.emit = this.emit.bind(this);
  }

  // Singleton pattern with event-driven architecture
  public static getInstance(): ClaimService {
    if (!ClaimService.instance) {
      ClaimService.instance = new ClaimService();
    }
    return ClaimService.instance;
  }

  // Type-safe event handling
  on<K extends keyof ClaimServiceEvents>(
    event: K, 
    listener: ClaimServiceEvents[K]
  ): this {
    return super.on(event, listener);
  }

  emit<K extends keyof ClaimServiceEvents>(
    event: K, 
    ...args: Parameters<ClaimServiceEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }

  // Static methods for service operations
  public static async createClaim(
    claimData: z.infer<typeof ClaimInputSchema>
  ): Promise<ServiceResult<WithId<BusinessClaim>>> {
    const db = await getMongoDb();
    const collection = db.collection<BusinessClaim>(this.COLLECTION);
    const businessCollection = db.collection<LoadedTeaClub>('businesses');

    try {
      // Validate input
      const validatedData = ClaimInputSchema.parse(claimData);

      // Check if business exists
      const business = await businessCollection.findOne({ 
        _id: new ObjectId(validatedData.businessId) 
      });

      if (!business) {
        return { 
          success: false, 
          error: 'Business not found' 
        };
      }

      const newClaim: Omit<BusinessClaim, '_id'> = {
        businessId: new ObjectId(validatedData.businessId),
        userId: new ObjectId(validatedData.userId),
        status: 'pending',
        verificationStatus: 'not_started',
        estimatedReviewTime: 48,  // Default 48 hours
        priority: 'standard',
        documents: {
          businessLicense: validatedData.documents?.businessLicense || '',
          proofOfOwnership: validatedData.documents?.proofOfOwnership || '',
          governmentId: validatedData.documents?.governmentId || '',
          utilityBill: validatedData.documents?.utilityBill || '',
          taxDocument: validatedData.documents?.taxDocument || '',
          additionalDocuments: validatedData.documents?.additionalDocuments || []
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        reviewedAt: undefined,
        verificationSteps: [],
        reviewedBy: undefined
      };

      const result = await collection.insertOne(newClaim);
      const claim = { ...newClaim, _id: result.insertedId };

      // Emit event
      this.getInstance().emit('claim:created', claim);

      return { 
        success: true, 
        data: claim 
      };
    } catch (error) {
      console.error('Claim creation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Claim creation failed' 
      };
    }
  }

  public static async updateVerificationStep(
    claimId: string, 
    stepData: {
      method: VerificationMethod;
      status: 'pending' | 'in_progress' | 'completed' | 'failed';
      details?: string;
    }
  ): Promise<ServiceResult<WithId<BusinessClaim>>> {
    const db = await getMongoDb();
    const collection = db.collection<BusinessClaim>(this.COLLECTION);

    try {
      const claim = await collection.findOne({ _id: new ObjectId(claimId) });
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

      const updateResult = await collection.findOneAndUpdate(
        { _id: new ObjectId(claimId) },
        { 
          $set: { 
            verificationSteps: updatedVerificationSteps
          } 
        },
        { returnDocument: 'after' }
      );

      if (!updateResult) {
        return { 
          success: false, 
          error: 'Failed to update claim' 
        };
      }

      // Emit event
      this.getInstance().emit('claim:updated', updateResult as WithId<BusinessClaim>);

      return { 
        success: true, 
        data: updateResult as WithId<BusinessClaim>
      };
    } catch (error) {
      console.error('Verification step update error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  public static async getClaimById(claimId: string): Promise<WithId<BusinessClaim> | null> {
    const db = await getMongoDb();
    const collection = db.collection<BusinessClaim>(this.COLLECTION);
    
    return collection.findOne({ _id: new ObjectId(claimId) }) as Promise<WithId<BusinessClaim> | null>;
  }

  public static async getClaimsByStatus(
    status: ClaimStatus, 
    limit: number = 10, 
    page: number = 1
  ): Promise<WithId<BusinessClaim>[]> {
    const db = await getMongoDb();
    const collection = db.collection<BusinessClaim>(this.COLLECTION);
    
    return collection
      .find({ status })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .toArray() as Promise<WithId<BusinessClaim>[]>;
  }

  public static async getRecentClaims(
    limit: number = 10, 
    page: number = 1
  ): Promise<WithId<BusinessClaim>[]> {
    const db = await getMongoDb();
    const collection = db.collection<BusinessClaim>(this.COLLECTION);
    
    return collection
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .toArray() as Promise<WithId<BusinessClaim>[]>;
  }

  public static async getPendingClaimsCount(): Promise<number> {
    const db = await getMongoDb();
    const collection = db.collection<BusinessClaim>(this.COLLECTION);
    
    return collection.countDocuments({ status: 'pending' });
  }

  // Simplified method to update claim status
  public static async updateClaimStatus(
    claimId: string, 
    updateData: ClaimStatus
  ): Promise<ServiceResult<WithId<BusinessClaim>>> {
    const db = await getMongoDb();
    const collection = db.collection<BusinessClaim>(this.COLLECTION);

    try {
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(claimId) },
        { 
          $set: { 
            ...updateData,
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

      // Emit event
      this.getInstance().emit('claim:status-changed', result as WithId<BusinessClaim>);

      // Send email notification
      await sendClaimStatusEmail(
        result.businessName || 'Unknown Business', 
        updateData.status, 
        result.userId.toString()
      );

      return { 
        success: true, 
        data: result as WithId<BusinessClaim>
      };
    } catch (error) {
      console.error('Claim status update error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Update claim verification step
  public static async updateClaimVerificationStep(
    claimId: string, 
    verificationStep: VerificationStep
  ): Promise<ServiceResult<WithId<BusinessClaim>>> {
    const db = await getMongoDb();
    const collection = db.collection<BusinessClaim>(this.COLLECTION);

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

      // Emit event
      this.getInstance().emit('claim:verification-updated', result as WithId<BusinessClaim>);

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

  // Approve claim method
  public static async approveClaim(
    claimId: string, 
    businessId?: string
  ): Promise<boolean> {
    const db = await getMongoDb();
    const claimCollection = db.collection<BusinessClaim>(this.COLLECTION);
    const businessCollection = db.collection<LoadedTeaClub>('businesses');

    try {
      // Update claim status
      const claimUpdateResult = await claimCollection.findOneAndUpdate(
        { _id: new ObjectId(claimId) },
        { 
          $set: { 
            status: 'approved',
            reviewedAt: new Date()
          } 
        }
      );

      // If businessId is provided, update business ownership
      if (businessId && claimUpdateResult) {
        await businessCollection.findOneAndUpdate(
          { _id: new ObjectId(businessId) },
          { 
            $set: { 
              ownerId: claimUpdateResult.userId,
              claimedAt: new Date()
            } 
          }
        );
      }

      return true;
    } catch (error) {
      console.error('Claim approval error:', error);
      return false;
    }
  }

  public static async sendClaimStatusEmail(
    claimId: string, 
    status: 'approved' | 'rejected'
  ): Promise<void> {
    const db = await getMongoDb();
    const claimCollection = db.collection<BusinessClaim>(this.COLLECTION);
    const userCollection = db.collection<User>('users');
    const businessCollection = db.collection<LoadedTeaClub>('businesses');

    const claim = await claimCollection.findOne({ _id: new ObjectId(claimId) });
    if (!claim) {
      throw new Error('Claim not found');
    }

    const user = await userCollection.findOne({ _id: claim.userId });
    const business = await businessCollection.findOne({ _id: claim.businessId });

    if (user?.email) {
      await sendClaimStatusEmail({
        email: user.email,
        businessName: business?.name || 'Your Business', 
        status
      });
    }
  }
}

export default ClaimService;
