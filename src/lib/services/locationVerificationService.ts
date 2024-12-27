import { connectToDatabase } from '@/lib/mongodb';

export interface ClubLocation {
  clubId: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

export class LocationVerificationService {
  // Haversine formula for calculating distance between two lat/long points
  static calculateHaversineDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  // Add or update club location
  static async addClubLocation(
    clubLocation: ClubLocation
  ): Promise<string> {
    const { db } = await connectToDatabase();

    const result = await db.collection('club_locations').updateOne(
      { clubId: clubLocation.clubId },
      { $set: clubLocation },
      { upsert: true }
    );

    return result.upsertedId?.$oid || clubLocation.clubId;
  }

  // Verify if user is within club's geofence
  static async verifyLocation(
    clubId: string, 
    userLatitude: number, 
    userLongitude: number
  ): Promise<boolean> {
    const { db } = await connectToDatabase();

    const clubLocation = await db.collection('club_locations').findOne({ 
      clubId 
    });

    if (!clubLocation) {
      throw new Error('Club location not found');
    }

    const distance = this.calculateHaversineDistance(
      userLatitude, 
      userLongitude, 
      clubLocation.latitude, 
      clubLocation.longitude
    );

    return distance <= clubLocation.radiusMeters;
  }

  // Get nearby clubs
  static async findNearbyCubs(
    userLatitude: number, 
    userLongitude: number,
    maxDistanceMeters: number = 5000
  ): Promise<ClubLocation[]> {
    const { db } = await connectToDatabase();

    const nearbyClubs = await db.collection('club_locations')
      .find({})
      .toArray();

    return nearbyClubs.filter(club => {
      const distance = this.calculateHaversineDistance(
        userLatitude, 
        userLongitude, 
        club.latitude, 
        club.longitude
      );
      return distance <= maxDistanceMeters;
    });
  }
}
