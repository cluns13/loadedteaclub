import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    // Verify business user session
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'BUSINESS') {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 403 });
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Fetch business-specific analytics
    const businessId = session.user.id;
    
    // Example analytics aggregation
    const analyticsResult = await db.collection('business_analytics').aggregate([
      { $match: { businessId } },
      { 
        $group: {
          _id: null,
          totalCustomers: { $sum: '$customerCount' },
          monthlyVisitors: { $avg: '$monthlyVisitors' },
          redemptionRate: { $avg: '$redemptionRate' }
        }
      }
    ]).toArray();

    // If no data found, return default values
    const analytics = analyticsResult[0] || {
      totalCustomers: 0,
      monthlyVisitors: 0,
      redemptionRate: 0
    };

    return NextResponse.json({
      name: session.user.name || 'Nutrition Club',
      totalCustomers: analytics.totalCustomers,
      monthlyVisitors: Math.round(analytics.monthlyVisitors),
      redemptionRate: Math.round(analytics.redemptionRate * 100) / 100
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics' 
    }, { status: 500 });
  }
}
