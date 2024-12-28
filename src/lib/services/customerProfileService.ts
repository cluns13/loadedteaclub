import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';
import { User } from '@/types/models';
import { WithId } from '@/types/database';

export class CustomerProfileService {
  static readonly COLLECTION = 'customerProfiles';

  static async createProfile(
    profile: Partial<User> & { 
      globalCustomerId?: string 
    }
  ): Promise<WithId<User>> {
    const db = await getDb();
    
    const profileToInsert: User = {
      _id: new ObjectId(),
      id: profile.id || '',
      name: profile.name ?? '',
      email: profile.email ?? '',
      hashedPassword: profile.hashedPassword ?? '',
      globalCustomerId: profile.globalCustomerId ?? undefined,
      role: profile.role ?? 'USER',
      isAdmin: profile.isAdmin ?? false,
      isBusinessOwner: profile.isBusinessOwner ?? false,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Optional fields with explicit undefined
      image: profile.image ?? undefined,
      reviews: profile.reviews ?? undefined,
      savedBusinesses: profile.savedBusinesses ?? undefined,
      emailVerified: profile.emailVerified ?? undefined,
      twoFactorEnabled: profile.twoFactorEnabled ?? undefined,
      
      // Business related fields
      businessName: profile.businessName ?? undefined,
      phone: profile.phone ?? undefined,
      businessInfo: profile.businessInfo ? {
        businessName: profile.businessInfo.businessName,
        phone: profile.businessInfo.phone,
        businessId: profile.businessInfo.businessId ?? undefined
      } : undefined,
      
      // Club related fields
      clubId: profile.clubId ?? undefined,
      isClubOwner: profile.isClubOwner ?? undefined,
      rewardPoints: profile.rewardPoints ?? undefined,
      
      // Activity tracking
      lastLogin: profile.lastLogin ?? undefined,
      registrationSource: profile.registrationSource ?? undefined,
      
      // Payment fields
      stripeCustomerId: profile.stripeCustomerId ?? undefined,
      stripeSubscriptionId: profile.stripeSubscriptionId ?? undefined,
      
      // Referral system
      referralCode: profile.referralCode ?? undefined,
      referredBy: profile.referredBy ?? undefined
    };

    const result = await db.collection<User>(CustomerProfileService.COLLECTION)
      .insertOne(profileToInsert);

    return {
      ...profileToInsert,
      _id: result.insertedId
    };
  }

  static async findProfileByGlobalCustomerId(
    globalCustomerId: string
  ): Promise<WithId<User> | null> {
    const db = await getDb();
    return await db.collection<User>(CustomerProfileService.COLLECTION)
      .findOne({ globalCustomerId });
  }
}
