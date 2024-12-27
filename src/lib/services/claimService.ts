import { ObjectId } from 'mongodb';
import { BusinessClaim, ClaimStatus, VerificationStep } from '@/types/claims';
import { MenuItem } from '@/lib/services/menuValidationService';
import { getMongoDb } from '@/lib/db/mongodb';
import { BusinessService } from '@/lib/db/services/businessService';
import { 
  sendClaimSubmittedEmail, 
  sendClaimStatusEmail,
  sendVerificationStepEmail,
  sendAdminNotificationEmail
} from '@/lib/email/email';

export class ClaimService {
  private static readonly COLLECTION = 'business_claims';

  static async getCollection() {
    const db = await getMongoDb();
    return db.collection<BusinessClaim>(this.COLLECTION);
  }

  static async createClaim(claim: Omit<BusinessClaim, '_id' | 'createdAt' | 'updatedAt'>) {
    const collection = await this.getCollection();
    const now = new Date();

    const defaultVerificationSteps: VerificationStep[] = [
      {
        method: 'documents',
        status: 'pending',
        details: 'Initial document review required'
      },
      {
        method: 'ownership_verification',
        status: 'pending',
        details: 'Ownership verification pending'
      }
    ];

    const newClaim: BusinessClaim = {
      ...claim,
      status: 'pending',
      verificationSteps: defaultVerificationSteps,
      createdAt: now,
      updatedAt: now,
      estimatedReviewTime: 48, // Default 2 days
      priority: 'standard'
    };

    const result = await collection.insertOne(newClaim);
    newClaim._id = result.insertedId;

    // Send emails
    await Promise.all([
      sendClaimSubmittedEmail(
        newClaim, 
        claim.businessName, 
        claim.userEmail
      ),
      sendAdminNotificationEmail(
        newClaim, 
        claim.businessName, 
        claim.userName
      )
    ]);

    return newClaim;
  }

  static async updateClaimStatus(
    claimId: string, 
    status: ClaimStatus, 
    reviewerId: string,
    reviewNotes?: string
  ) {
    const collection = await this.getCollection();
    
    const updateResult = await collection.findOneAndUpdate(
      { _id: new ObjectId(claimId) },
      { 
        $set: { 
          status, 
          reviewedBy: new ObjectId(reviewerId),
          reviewedAt: new Date(),
          reviewNotes,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );

    // Send claim status email
    if (status === 'approved' || status === 'rejected') {
      const claim = updateResult.value;
      const business = await BusinessService.getBusinessById(claim.businessId);
      await sendClaimStatusEmail(
        claim, 
        business.name, 
        claim.userEmail,
        status === 'approved' ? 'approved' : 'rejected',
        reviewNotes
      );
    }

    return updateResult;
  }

  static async addVerificationStep(
    claimId: string, 
    verificationStep: VerificationStep
  ) {
    const collection = await this.getCollection();
    
    const updateResult = await collection.findOneAndUpdate(
      { _id: new ObjectId(claimId) },
      { 
        $push: { 
          verificationSteps: verificationStep 
        },
        $set: {
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    // Send verification step email
    const claim = updateResult.value;
    const business = await BusinessService.getBusinessById(claim.businessId);
    await sendVerificationStepEmail(
      claim, 
      business.name, 
      claim.userEmail,
      verificationStep
    );

    return updateResult;
  }

  static async updateClaimVerificationStep(
    claimId: string, 
    method: string, 
    stepStatus: 'pending' | 'in_progress' | 'completed' | 'failed'
  ) {
    const collection = await this.getCollection();
    
    const updateResult = await collection.findOneAndUpdate(
      { 
        _id: new ObjectId(claimId),
        'verificationSteps.method': method 
      },
      { 
        $set: { 
          'verificationSteps.$.status': stepStatus,
          'verificationSteps.$.completedAt': stepStatus === 'completed' ? new Date() : undefined,
          updatedAt: new Date()
        } 
      },
      { returnDocument: 'after' }
    );

    // Send verification step email
    const claim = updateResult.value;
    const business = await BusinessService.getBusinessById(claim.businessId);
    const verificationStep = claim.verificationSteps.find(step => step.method === method);
    await sendVerificationStepEmail(
      claim, 
      business.name, 
      claim.userEmail,
      verificationStep
    );

    return updateResult;
  }

  static async getClaimById(claimId: string) {
    const collection = await this.getCollection();
    return collection.findOne({ _id: new ObjectId(claimId) });
  }

  static async getClaimsByUser(userId: string) {
    const collection = await this.getCollection();
    return collection.find({ userId: new ObjectId(userId) }).toArray();
  }

  static async getClaimsByStatus(status: ClaimStatus) {
    const collection = await this.getCollection();
    return collection.find({ status }).toArray();
  }

  static async getClaimWithDetails(claimId: string) {
    const collection = await this.getCollection();
    const businessCollection = await BusinessService.getCollection();

    const aggregationPipeline = [
      { $match: { _id: new ObjectId(claimId) } },
      {
        $lookup: {
          from: 'loaded_tea_clubs',
          localField: 'businessId',
          foreignField: '_id',
          as: 'business'
        }
      },
      { $unwind: '$business' },
      {
        $project: {
          business: {
            _id: 1,
            name: 1,
            address: 1,
            city: 1,
            state: 1
          },
          claimant: {
            _id: 1,
            name: 1,
            email: 1
          },
          reviewer: {
            _id: 1,
            name: 1
          }
        }
      }
    ];

    const [claim] = await collection.aggregate(aggregationPipeline).toArray();
    return claim;
  }

  static async deleteClaim(claimId: string) {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(claimId) });
    return result.deletedCount > 0;
  }

  static async getPendingClaimsCount() {
    const collection = await this.getCollection();
    return collection.countDocuments({ status: 'pending' });
  }

  static async getRecentClaims(limit = 5) {
    const collection = await this.getCollection();
    return collection.find().sort({ createdAt: -1 }).limit(limit).toArray();
  }
}
