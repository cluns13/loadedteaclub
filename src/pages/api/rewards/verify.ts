import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import { RewardsService } from '@/lib/services/rewardsService';

interface RedemptionPayload {
  userId: string;
  clubId: string;
  token: string;
  type: 'FREE_DRINK' | 'DISCOUNT';
  expiresAt: string;
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      success: false 
    });
  }

  try {
    // Authenticate business user
    const session = await getServerSession(req, res, authOptions);
    if (!session || session.user.role !== 'BUSINESS') {
      return res.status(403).json({ 
        error: 'Unauthorized: Business access required',
        success: false 
      });
    }

    // Parse and validate redemption payload
    const payload: RedemptionPayload = JSON.parse(req.body);
    const { 
      userId, 
      clubId, 
      token, 
      type, 
      expiresAt 
    } = payload;

    // Check token expiration
    const expirationDate = new Date(expiresAt);
    if (expirationDate < new Date()) {
      return res.status(400).json({ 
        error: 'Redemption token has expired',
        success: false 
      });
    }

    // Verify token matches business's club
    if (session.user.clubId !== clubId) {
      return res.status(403).json({ 
        error: 'Invalid club for redemption',
        success: false 
      });
    }

    // Process redemption
    const rewardsService = new RewardsService();
    const result = await rewardsService.processRedemption({
      userId,
      clubId,
      redemptionType: type
    });

    // Log successful redemption
    const { db } = await connectToDatabase();
    await db.collection('redemption_logs').insertOne({
      businessId: session.user.id,
      userId,
      clubId,
      type,
      timestamp: new Date(),
      status: 'SUCCESS'
    });

    return res.status(200).json({ 
      message: 'Redemption successful',
      success: true,
      ...result 
    });

  } catch (error) {
    console.error('Redemption verification error:', error);

    // Log failed redemption attempt
    try {
      const { db } = await connectToDatabase();
      await db.collection('redemption_logs').insertOne({
        businessId: session?.user?.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        status: 'FAILED'
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return res.status(500).json({ 
      error: 'Redemption verification failed',
      success: false 
    });
  }
}
