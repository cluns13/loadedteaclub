import { ObjectId } from 'mongodb';
import { MenuItem } from '@/lib/services/menuValidationService';

export type ClaimStatus = 'pending' | 'in_review' | 'needs_more_info' | 'approved' | 'rejected';

export type VerificationMethod = 'phone' | 'email' | 'mail' | 'documents' | 'menu' | 'ownership_verification';

export type VerificationStep = {
  method: VerificationMethod;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  details?: string | undefined;
  completedAt?: Date | undefined;
  assignedTo?: ObjectId | undefined;
  value?: string | boolean | number | null | undefined;
}

export type VerificationStatus = {
  method: VerificationMethod;
  verified: boolean;
  verifiedAt?: Date | undefined;
  verificationCode?: string | undefined;
  attempts: number;
  lastAttempt?: Date | undefined;
  menuItems?: MenuItem[] | undefined;
  menuVerificationNotes?: string | undefined;
}

export type ClaimDocuments = {
  businessLicense?: string | undefined;
  proofOfOwnership?: string | undefined;
  governmentId?: string | undefined;
  utilityBill?: string | undefined;
  taxDocument?: string | undefined;
  articleOfIncorporation?: string | undefined;
  bankStatement?: string | undefined;
  leaseAgreement?: string | undefined;
  menuPhotos?: string[] | undefined;
  drinkPhotos?: string[] | undefined;
  additionalDocuments?: string[] | undefined;
}

export type BusinessClaim = {
  _id?: ObjectId | undefined;
  businessId: ObjectId;
  userId: ObjectId;
  status: ClaimStatus;
  documents: ClaimDocuments;
  verificationSteps: VerificationStep[];
  verificationStatus: VerificationStatus[];
  businessEmail?: string | undefined;
  businessPhone?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
  estimatedReviewTime: number;
  priority: 'standard' | 'urgent' | 'high_priority';
  reviewedBy?: ObjectId | undefined;
  reviewedAt?: Date | undefined;
  reviewNotes?: string | undefined;
}

export type ClaimReviewAction = {
  claimId: string;
  action: 'approve' | 'reject';
  reviewNotes?: string | undefined;
  menuVerification?: {
    isValid: boolean;
    notes?: string | undefined;
  } | undefined;
}

export type ClaimWithDetails = {
  _id: ObjectId;
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
  status: ClaimStatus;
  verificationSteps: VerificationStep[];
  reviewer?: {
    _id: string;
    name: string;
  } | undefined;
  createdAt: Date;
  updatedAt: Date;
}
