import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { getDb } from '@/lib/db/mongodb';
import type { User } from '@/types/models';

type RegistrationData = {
  email: string;
  password: string;
  name?: string;
  businessName?: string;
  phone?: string;
  role?: string;
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const db = await getDb();
    const data: RegistrationData = await request.json();

    if (!data.email || !data.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (data.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate role
    if (data.role && !['USER', 'BUSINESS_OWNER'].includes(data.role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const existingUser = await db.collection('users').findOne({ 
      email: data.email.toLowerCase() 
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(data.password, 10);

    const newUser: Omit<User, '_id'> = {
      email: data.email.toLowerCase(),
      name: data.name ?? '',
      hashedPassword,
      role: data.role ?? 'USER',
      isClubOwner: false,
      businessName: data.businessName ?? '',
      phone: data.phone ?? '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(newUser);

    return NextResponse.json(
      { 
        id: result.insertedId.toString(), 
        email: newUser.email 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
