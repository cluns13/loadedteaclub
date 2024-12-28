import { getDb } from '../db/mongodb';
import { ObjectId } from 'mongodb';
import { User } from '@/types/models';

export function getUserName(user: User | { _id: ObjectId; name?: string } | string): string {
  if (typeof user === 'string') {
    // If a string (userId) is passed, we'll fetch the user synchronously
    // This is not ideal and should be replaced with an async approach
    console.warn('Synchronous user name retrieval is deprecated. Use async method.');
    return 'Unknown User';
  }

  if (typeof user === 'object' && 'name' in user) {
    return user.name ?? 'Unknown User';
  }

  return 'Unknown User';
}

export async function getUserNameAsync(userId: string): Promise<string> {
  const db = await getDb();
  const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
  
  if (!user) return 'Unknown User';

  return user.name || 'Unknown User';
}
