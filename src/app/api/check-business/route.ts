import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/mongodb';

export async function GET() {
  try {
    const db = await getDb();
    const businesses = await db.collection('businesses').find({}).toArray();
    return NextResponse.json({ businesses });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
  }
}
