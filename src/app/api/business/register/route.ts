import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { createBusinessRewardsProgram } from '@/lib/services/rewardsService';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    // Verify nutrition club user session
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'BUSINESS') {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 403 });
    }

    // Parse request body
    const { 
      clubName, 
      rewardThreshold = 10 // Default to 10 loaded tea purchases for a free tea
    } = await request.json();

    const { db } = await connectToDatabase();

    // Create nutrition club profile
    const clubProfile = await db.collection('nutrition_clubs').insertOne({
      name: clubName,
      ownerId: session.user.id,
      createdAt: new Date()
    });

    // Set up loaded tea rewards program
    const rewardsConfigId = await createBusinessRewardsProgram(
      clubProfile.insertedId.toString(), 
      rewardThreshold
    );

    return NextResponse.json({ 
      success: true, 
      clubId: clubProfile.insertedId,
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
