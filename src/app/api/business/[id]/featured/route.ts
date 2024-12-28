import { NextResponse } from 'next/server';

type Params = {
  params: {
    id: string;
  }
};

export async function GET(
  _request: Request, 
  { params }: Params
) {
  // Mock implementation for featured businesses
  return NextResponse.json({
    success: true,
    featuredItems: [
      {
        id: 'mock-item-1',
        name: 'Mock Item 1',
      }
    ]
  });
}

export async function POST(
  request: Request, 
  { params }: Params
) {
  try {
    const { itemId } = await request.json();

    // Mock authentication
    const session = { user: { id: 'mock-user-id' } };

    if (!params.id || !itemId) {
      return NextResponse.json(
        { error: 'Business ID and Item ID are required' },
        { status: 400 }
      );
    }

    // Mock business data
    const business = {
      id: params.id,
      claimedBy: session.user.id,
      featuredItems: [] as string[]
    };

    // Toggle featured status
    const isCurrentlyFeatured = business.featuredItems.includes(itemId);

    if (isCurrentlyFeatured) {
      business.featuredItems = business.featuredItems.filter(item => item !== itemId);
    } else {
      business.featuredItems.push(itemId);
    }

    return NextResponse.json({
      success: true,
      featuredItems: business.featuredItems
    });
  } catch (error) {
    console.error('Error updating featured items:', error);
    return NextResponse.json(
      { error: 'Failed to update featured items' },
      { status: 500 }
    );
  }
}
