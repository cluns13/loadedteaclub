import { CustomerProfileService } from './customerProfileService';
import { LocationVerificationService } from './locationVerificationService';
import { generateCustomerId } from '@/lib/utils/customerIdGenerator';
import { connectToDatabase } from '@/lib/mongodb';

export interface CheckInSession {
  globalCustomerId: string;
  clubId: string;
  localCustomerId: string;
  checkedInAt: Date;
  latitude: number;
  longitude: number;
}

export class CustomerCheckInService {
  // Comprehensive check-in process
  static async checkIn(
    globalCustomerId: string,
    clubId: string,
    userLocation: {
      latitude: number;
      longitude: number;
    }
  ): Promise<{
    localCustomerId: string;
    isNewMember: boolean;
  }> {
    // 1. Verify location
    const isAtCorrectLocation = await LocationVerificationService.verifyLocation(
      clubId, 
      userLocation.latitude, 
      userLocation.longitude
    );

    if (!isAtCorrectLocation) {
      throw new Error('You are not at the correct location for this club');
    }

    // 2. Get or create club membership
    const profile = await CustomerProfileService.getProfile(globalCustomerId);
    
    let clubMembership = profile.clubMemberships.find(
      membership => membership.clubId === clubId
    );

    let isNewMember = false;
    if (!clubMembership) {
      // Join the club if not already a member
      clubMembership = await CustomerProfileService.joinClub(
        globalCustomerId, 
        clubId
      );
      isNewMember = true;
    }

    // 3. Create check-in session
    await this.createCheckInSession({
      globalCustomerId,
      clubId,
      localCustomerId: clubMembership.localCustomerId,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude
    });

    return {
      localCustomerId: clubMembership.localCustomerId,
      isNewMember
    };
  }

  // Create a check-in session record
  static async createCheckInSession(
    sessionData: Omit<CheckInSession, 'checkedInAt'>
  ): Promise<string> {
    const { db } = await connectToDatabase();

    const result = await db.collection('check_in_sessions').insertOne({
      ...sessionData,
      checkedInAt: new Date()
    });

    return result.insertedId.toString();
  }

  // Validate a local customer ID for a specific club
  static async validateLocalCustomerId(
    localCustomerId: string,
    clubId: string
  ): Promise<boolean> {
    const { db } = await connectToDatabase();

    // Check if local customer ID matches the club's prefix
    const expectedPrefix = clubId
      .replace(/[^A-Z]/g, '')
      .substring(0, 3)
      .toUpperCase();

    const idPrefix = localCustomerId.substring(0, 3);

    return idPrefix === expectedPrefix;
  }

  // Get nearby clubs during check-in
  static async findNearbyCubs(
    userLocation: {
      latitude: number;
      longitude: number;
    }
  ) {
    return LocationVerificationService.findNearbyCubs(
      userLocation.latitude, 
      userLocation.longitude
    );
  }
}
