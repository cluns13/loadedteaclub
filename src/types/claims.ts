import { ObjectId } from 'mongodb';
import { MenuItem } from '@/lib/services/menuValidationService';

export type ClaimStatus = 'pending' | 'in_review' | 'needs_more_info' | 'approved' | 'rejected';

export type VerificationMethod = 'phone' | 'email' | 'mail' | 'documents' | 'menu' | 'ownership_verification';

export interface VerificationStep {
  method: VerificationMethod;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  details?: string;
  completedAt?: Date;
  assignedTo?: ObjectId;
}

export interface VerificationStatus {
  method: VerificationMethod;
  verified: boolean;
  verifiedAt?: Date;
  verificationCode?: string;
  attempts: number;
  lastAttempt?: Date;
  menuItems?: MenuItem[];
  menuVerificationNotes?: string;
}

export interface ClaimDocuments {
  businessLicense: string;
  proofOfOwnership: string;
  governmentId: string;
  utilityBill?: string;
  taxDocument?: string;
  articleOfIncorporation?: string;
  bankStatement?: string;
  leaseAgreement?: string;
  menuPhotos?: string[];
  drinkPhotos?: string[];
  additionalDocuments?: string[];
}

export interface BusinessClaim {
  _id?: ObjectId;
  businessId: ObjectId;
  userId: ObjectId;
  status: ClaimStatus;
  documents: ClaimDocuments;
  verificationSteps: VerificationStep[];
  verificationStatus: VerificationStatus[];
  businessEmail?: string;
  businessPhone?: string;
  additionalNotes?: string;
  reviewNotes?: string;
  reviewedBy?: ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  estimatedReviewTime?: number; // in hours
  priority?: 'standard' | 'urgent';
  menu?: {
    items: MenuItem[];
    lastUpdated: Date;
    verifiedAt?: Date;
    verifiedBy?: ObjectId;
  };
}

export interface ClaimReviewAction {
  claimId: string;
  action: 'approve' | 'reject';
  reviewNotes?: string;
  menuVerification?: {
    isValid: boolean;
    notes?: string;
  };
}

export interface ClaimWithDetails extends Omit<BusinessClaim, 'businessId' | 'userId' | 'reviewedBy'> {
  business: {
    _id: string;
    name: string;
    address: string;
    city: string;
    state: string;
  };
  claimant: {
    _id: string;
    name: string;
    email: string;
  };
  reviewer?: {
    _id: string;
    name: string;
  };
}
