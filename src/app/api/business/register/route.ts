import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { createBusinessRewardsProgram } from '@/lib/services/rewardsService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { z } from 'zod';
import { ObjectId, InsertOneResult } from 'mongodb';

const registerSchema = z.object({
  clubName: z.string().min(2, 'Club name must be at least 2 characters'),
  rewardThreshold: z.number().min(1, 'Reward threshold must be at least 1').optional()
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'BUSINESS') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.errors },
        { status: 400 }
      );
    }

    const { 
      clubName, 
      rewardThreshold = 10 // Default to 10 loaded tea purchases for a free tea
    } = validation.data;

    const { db } = await connectToDatabase();

    // Create nutrition club profile
    const clubProfile: InsertOneResult<{ 
      name: string; 
      ownerId: ObjectId; 
      createdAt: Date 
    }> = await db.collection('nutrition_clubs').insertOne({
      name: clubName,
      ownerId: new ObjectId(session.user.id),
      createdAt: new Date()
    });

    // Validate insertion
    if (!clubProfile.acknowledged || !clubProfile.insertedId) {
      return NextResponse.json({ 
        error: 'Failed to create nutrition club profile' 
      }, { status: 500 });
    }

    // Set up loaded tea rewards program
    const rewardsConfigId = await createBusinessRewardsProgram(
      clubProfile.insertedId.toHexString(), 
      rewardThreshold
    );

    return NextResponse.json({ 
      success: true, 
      clubId: clubProfile.insertedId.toHexString(),
      rewardsConfigId,
      message: 'Nutrition Club registered successfully!' 
    }, { status: 201 });

  } catch (error) {
    console.error('Nutrition Club registration error:', error);
    return NextResponse.json({ 
      error: 'Registration failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
