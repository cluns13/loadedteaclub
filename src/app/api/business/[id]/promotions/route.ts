import { NextRequest, NextResponse } from 'next/server';

type Params = {
  params: {
    id: string;
  }
};

type Promotion = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
};

type Business = {
  id: string;
  claimedBy: string;
  promotions: Promotion[];
};

const businesses: Business[] = [
  {
    id: 'mock-business-1',
    claimedBy: 'mock-user-id',
    promotions: [
      {
        id: 'mock-promo-1',
        name: 'Summer Special',
        description: 'Get 20% off your first tea',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      }
    ]
  }
];

export async function GET(
  _request: NextRequest, 
  { params }: Params
) {
  // Mock implementation for business promotions
  const business = businesses.find(b => b.id === params.id);
  if (!business) {
    return NextResponse.json(
      { error: 'Business not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    promotions: business.promotions
  });
}

export async function POST(
  request: NextRequest, 
  { params }: Params
) {
  try {
    const { promotion } = await request.json();

    // Mock authentication
    const session = { user: { id: 'mock-user-id' } };

    if (!params.id || !promotion) {
      return NextResponse.json(
        { error: 'Business ID and Promotion details are required' },
        { status: 400 }
      );
    }

    // Mock business data
    const business = businesses.find(b => b.id === params.id);
    if (!business || business.claimedBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Business not found or not authorized' },
        { status: 404 }
      );
    }

    // Add new promotion
    business.promotions.push({
      id: promotion.id || 'new-promo-' + Date.now(),
      name: promotion.name || 'Unnamed Promotion',
      description: promotion.description || '',
      startDate: promotion.startDate || new Date().toISOString(),
      endDate: promotion.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return NextResponse.json({
      success: true,
      promotions: business.promotions
    });
  } catch (error) {
    console.error('Error creating promotion:', error);
    return NextResponse.json(
      { error: 'Failed to create promotion' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest, 
  { params }: Params
) {
  try {
    const { promotion } = await request.json();

    // Mock authentication
    const session = { user: { id: 'mock-user-id' } };

    if (!params.id || !promotion) {
      return NextResponse.json(
        { error: 'Business ID and Promotion details are required' },
        { status: 400 }
      );
    }

    // Mock business data
    const business = businesses.find(b => b.id === params.id);
    if (!business || business.claimedBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Business not found or not authorized' },
        { status: 404 }
      );
    }

    const updatedPromotionIndex = business.promotions.findIndex(p => p.id === promotion.id);
    if (updatedPromotionIndex === -1) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    business.promotions[updatedPromotionIndex] = {
      ...business.promotions[updatedPromotionIndex],
      ...promotion,
      startDate: promotion.startDate || business.promotions[updatedPromotionIndex].startDate,
      endDate: promotion.endDate || business.promotions[updatedPromotionIndex].endDate,
    };

    return NextResponse.json({
      success: true,
      promotions: business.promotions
    });
  } catch (error) {
    console.error('Error updating promotion:', error);
    return NextResponse.json(
      { error: 'Failed to update promotion' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest, 
  { params }: Params
) {
  try {
    // Mock authentication
    const session = { user: { id: 'mock-user-id' } };

    if (!params.id) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const promotionId = searchParams.get('promotionId');

    if (!promotionId) {
      return NextResponse.json(
        { error: 'Promotion ID is required' },
        { status: 400 }
      );
    }

    // Mock business data
    const business = businesses.find(b => b.id === params.id);
    if (!business || business.claimedBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Business not found or not authorized' },
        { status: 404 }
      );
    }

    const promotionIndex = business.promotions.findIndex(p => p.id === promotionId);
    if (promotionIndex === -1) {
      return NextResponse.json(
        { error: 'Promotion not found' },
        { status: 404 }
      );
    }

    business.promotions.splice(promotionIndex, 1);

    return NextResponse.json({
      success: true,
      promotions: business.promotions
    });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return NextResponse.json(
      { error: 'Failed to delete promotion' },
      { status: 500 }
    );
  }
}
