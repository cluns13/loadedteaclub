import { randomBytes, createHash } from 'crypto';
import { MongoClient, ObjectId } from 'mongodb';

export interface RedemptionToken {
  id: string;
  userId: string;
  clubId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  isUsed: boolean;
  redemptionType: 'FREE_DRINK' | 'DISCOUNT';
}

export class RewardsTokenService {
  private client: MongoClient;
  private static TOKEN_EXPIRY_MINUTES = 15;

  constructor() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MongoDB URI not configured');
    }
    this.client = new MongoClient(uri);
  }

  private generateSecureToken(): string {
    return randomBytes(32).toString('hex');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async createRedemptionToken(
    userId: string, 
    clubId: string, 
    redemptionType: 'FREE_DRINK' | 'DISCOUNT'
  ): Promise<string> {
    const db = this.client.db('tea_finder');
    const tokenCollection = db.collection<RedemptionToken>('redemption_tokens');

    // Generate unique, secure token
    const rawToken = this.generateSecureToken();
    const hashedToken = this.hashToken(rawToken);

    const tokenRecord: RedemptionToken = {
      id: new ObjectId().toString(),
      userId,
      clubId,
      token: hashedToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.TOKEN_EXPIRY_MINUTES * 60 * 1000),
      isUsed: false,
      redemptionType
    };

    await tokenCollection.insertOne(tokenRecord);

    return rawToken; // Return unhashed token for QR generation
  }

  async verifyRedemptionToken(
    token: string, 
    userId: string, 
    clubId: string
  ): Promise<RedemptionToken | null> {
    const db = this.client.db('tea_finder');
    const tokenCollection = db.collection<RedemptionToken>('redemption_tokens');

    // Hash the provided token
    const hashedToken = this.hashToken(token);

    // Find matching, valid token
    const tokenRecord = await tokenCollection.findOne({
      token: hashedToken,
      userId,
      clubId,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    });

    return tokenRecord;
  }

  async markTokenAsUsed(tokenId: string): Promise<void> {
    const db = this.client.db('tea_finder');
    const tokenCollection = db.collection<RedemptionToken>('redemption_tokens');

    await tokenCollection.updateOne(
      { _id: new ObjectId(tokenId) },
      { $set: { isUsed: true } }
    );
  }

  async cleanupExpiredTokens(): Promise<number> {
    const db = this.client.db('tea_finder');
    const tokenCollection = db.collection<RedemptionToken>('redemption_tokens');

    const result = await tokenCollection.deleteMany({
      expiresAt: { $lt: new Date() }
    });

    return result.deletedCount;
  }
}
