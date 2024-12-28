import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { getDb } from '@/lib/db/mongodb';
import type { User } from '@/types/models';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const { name, email, password, role = 'USER', businessInfo } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['USER', 'BUSINESS_OWNER'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Validate business info if role is BUSINESS_OWNER
    if (role === 'BUSINESS_OWNER') {
      if (!businessInfo?.businessName || !businessInfo?.phone) {
        return NextResponse.json(
          { error: 'Business name and phone are required for business owners' },
          { status: 400 }
        );
      }
    }

    const db = await getDb();
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({
      email: email.toLowerCase()
    }) as User | null;

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user object
    const user: Partial<User> = {
      name,
      email: email.toLowerCase(),
      hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add business info if provided
    if (role === 'BUSINESS_OWNER' && businessInfo) {
      user.businessInfo = businessInfo;
    }

    // Insert user
    const result = await db.collection('users').insertOne(user as User);

    return NextResponse.json({
      message: 'Account created successfully',
      userId: result.insertedId
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
