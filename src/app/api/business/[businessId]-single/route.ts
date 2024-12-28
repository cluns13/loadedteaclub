import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { z } from 'zod';

// Schema for updating business details
const updateBusinessSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  hours: z.record(z.string()).optional(),
  menu: z.array(z.object({
    name: z.string(),
    category: z.string(),
    description: z.string().optional(),
    price: z.number().optional(),
    popular: z.boolean().optional(),
  })).optional(),
  popularItems: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  socialMedia: z.object({
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
  }).optional(),
});

type Params = {
  params: {
    businessId: string;
  }
};

const mockBusinesses = [
  {
    id: 'mock-business-1',
    name: 'Loaded Tea Downtown',
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '12345',
    phone: '(555) 123-4567',
    rewardsEnabled: true,
    onlineOrderingAvailable: true,
    menuItems: []
  }
];

export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = updateBusinessSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues.map(i => i.message).join(', ') },
        { status: 400 }
      );
    }

    const updateData = result.data;

    // Update business
    const business = mockBusinesses.find(b => b.id === params.businessId);
    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    Object.assign(business, updateData);

    return NextResponse.json({ success: true, business });
  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json(
      { error: 'Failed to update business' },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: Request, 
  { params }: Params
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const business = mockBusinesses.find(b => b.id === params.businessId);

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      business
    });
  } catch (error) {
    console.error('Error fetching business:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business' },
      { status: 500 }
    );
  }
}
