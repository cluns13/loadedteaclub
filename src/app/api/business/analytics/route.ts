import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/authOptions';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/db/database';
import { BusinessAnalytics } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const businessId = session.user.id;
    
    // Get analytics data
    const db = await getDatabase();
    const analyticsResult = await db.collection('businessAnalytics').find().toArray();

    // Default analytics values
    const defaultAnalytics: Omit<BusinessAnalytics, '_id' | 'businessId'> = {
      totalViews: 0,
      totalClicks: 0,
      avgDuration: 0
    };

    // Find analytics for the specific business
    const analytics = analyticsResult.find(
      a => a.businessId.toString() === businessId
    ) || defaultAnalytics;

    return NextResponse.json({
      success: true,
      name: session.user.name || 'Business Owner',
      totalViews: analytics.totalViews,
      totalClicks: analytics.totalClicks,
      avgDuration: Math.round(analytics.avgDuration)
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
