import { getDb } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';
import { BusinessClaim, VerificationMethod, VerificationStatus } from '@/types/claims';
import { sendEmail } from '@/lib/email/email';
import { generateVerificationCode } from '@/lib/utils/verification';
import { MenuValidationService } from './menuValidationService';

export class VerificationService {
  private static async getCollection() {
    const db = await getDb();
    return db.collection('businessClaims');
  }

  static async initiateVerification(claimId: string, method: VerificationMethod): Promise<boolean> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: new ObjectId(claimId) });

    if (!doc) {
      throw new Error('Claim not found');
    }

    const claim = doc as BusinessClaim;

    const verificationCode = generateVerificationCode();
    const verificationStatus: VerificationStatus = {
      method,
      verified: false,
      verificationCode,
      attempts: 0,
      lastAttempt: new Date(),
    };

    // Add or update verification status
    await collection.updateOne(
      { _id: new ObjectId(claimId) },
      {
        $set: {
          [`verificationStatus.${claim.verificationStatus?.length || 0}`]: verificationStatus
        }
      }
    );

    // Handle different verification methods
    switch (method) {
      case 'email':
        await this.sendEmailVerification(claim, verificationCode);
        break;
      case 'phone':
        await this.sendPhoneVerification(claim, verificationCode);
        break;
      case 'mail':
        await this.sendMailVerification(claim, verificationCode);
        break;
      case 'documents':
        // Document verification is handled separately through the admin review process
        break;
      case 'menu':
        await this.initiateMenuVerification(claim);
        break;
    }

    return true;
  }

  private static async initiateMenuVerification(claim: BusinessClaim) {
    if (!claim.menu?.items || claim.menu.items.length === 0) {
      throw new Error('Menu items are required for verification');
    }

    const validation = MenuValidationService.validateMenu(claim.menu);
    
    if (!validation.isValid) {
      const errors = [
        ...validation.missingCategories.map(cat => `Missing category: ${cat}`),
        ...validation.errors,
      ];
      
      throw new Error(`Menu validation failed: ${errors.join(', ')}`);
    }

    // Send email notification for menu review
    if (claim.businessEmail) {
      await sendEmail({
        to: claim.businessEmail,
        subject: 'Menu Verification in Progress',
        html: `
          <h1>Menu Verification</h1>
          <p>Your menu is being reviewed to verify that your business serves loaded teas and related products.</p>
          <p>Required items:</p>
          <ul>
            <li>At least 2 Loaded Teas</li>
            <li>At least 2 Lit Teas</li>
            <li>At least 2 Meal Replacements</li>
          </ul>
          <p>We'll notify you once the review is complete.</p>
        `
      });
    }
  }

  static async verifyCode(claimId: string, method: VerificationMethod, code: string): Promise<boolean> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: new ObjectId(claimId) });

    if (!doc) {
      throw new Error('Claim not found');
    }

    const claim = doc as BusinessClaim;

    const verificationStatus = claim.verificationStatus?.find(v => v.method === method);
    if (!verificationStatus) {
      throw new Error('Verification not initiated');
    }

    if (verificationStatus.attempts >= 3) {
      throw new Error('Maximum verification attempts exceeded');
    }

    // Update attempts
    await collection.updateOne(
      { 
        _id: new ObjectId(claimId),
        'verificationStatus.method': method
      },
      {
        $inc: { 'verificationStatus.$.attempts': 1 },
        $set: { 'verificationStatus.$.lastAttempt': new Date() }
      }
    );

    if (verificationStatus.verificationCode !== code) {
      return false;
    }

    // Mark as verified
    await collection.updateOne(
      { 
        _id: new ObjectId(claimId),
        'verificationStatus.method': method
      },
      {
        $set: {
          'verificationStatus.$.verified': true,
          'verificationStatus.$.verifiedAt': new Date()
        }
      }
    );

    return true;
  }

  static async verifyMenu(
    claimId: string,
    isValid: boolean,
    notes?: string
  ): Promise<boolean> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: new ObjectId(claimId) });

    if (!doc) {
      throw new Error('Claim not found');
    }

    const claim = doc as BusinessClaim;

    // Update menu verification status
    await collection.updateOne(
      { _id: new ObjectId(claimId) },
      {
        $set: {
          'menu.verifiedAt': new Date(),
          'verificationStatus.$[elem].verified': isValid,
          'verificationStatus.$[elem].verifiedAt': new Date(),
          'verificationStatus.$[elem].menuVerificationNotes': notes
        }
      },
      {
        arrayFilters: [{ 'elem.method': 'menu' }]
      }
    );

    // Send email notification
    if (claim.businessEmail) {
      await sendEmail({
        to: claim.businessEmail,
        subject: `Menu Verification ${isValid ? 'Approved' : 'Needs Updates'}`,
        html: `
          <h1>Menu Verification ${isValid ? 'Approved' : 'Needs Updates'}</h1>
          ${isValid 
            ? '<p>Your menu has been verified. Your business listing will now show as a verified loaded tea location.</p>'
            : `<p>Your menu needs some updates before we can verify your business:</p>
               <p>${notes}</p>
               <p>Please update your menu and submit for verification again.</p>`
          }
        `
      });
    }

    return true;
  }

  private static async sendEmailVerification(claim: BusinessClaim, code: string) {
    if (!claim.businessEmail) {
      throw new Error('Business email not provided');
    }

    await sendEmail({
      to: claim.businessEmail,
      subject: 'Verify Your Business Ownership',
      html: `
        <h1>Verify Your Business Ownership</h1>
        <p>Please use the following code to verify your business ownership:</p>
        <h2>${code}</h2>
        <p>This code will expire in 24 hours.</p>
      `
    });
  }

  private static async sendPhoneVerification(claim: BusinessClaim, code: string) {
    if (!claim.businessPhone) {
      throw new Error('Business phone not provided');
    }

    // Implement SMS service integration here
    console.log(`Would send SMS to ${claim.businessPhone} with code: ${code}`);
  }

  private static async sendMailVerification(claim: BusinessClaim, code: string) {
    // Implement physical mail service integration here
    console.log(`Would send physical mail with code: ${code}`);
  }

  static async getVerificationStatus(claimId: string): Promise<VerificationStatus[]> {
    const collection = await this.getCollection();
    const doc = await collection.findOne({ _id: new ObjectId(claimId) });

    if (!doc) {
      throw new Error('Claim not found');
    }

    const claim = doc as BusinessClaim;

    return claim.verificationStatus || [];
  }

  static async isFullyVerified(claimId: string): Promise<boolean> {
    const verificationStatus = await this.getVerificationStatus(claimId);
    
    // Check if we have at least one successful verification
    const hasVerification = verificationStatus.some(status => 
      status.method !== 'menu' && status.verified
    );
    
    // Check if required documents are present and verified
    const hasDocuments = verificationStatus.find(status => 
      status.method === 'documents' && status.verified
    );

    // Check if menu is verified
    const hasMenuVerification = verificationStatus.find(status =>
      status.method === 'menu' && status.verified
    );

    return hasVerification && !!hasDocuments && !!hasMenuVerification;
  }
}
