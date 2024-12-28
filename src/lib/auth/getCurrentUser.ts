import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { getDb } from '../db/mongodb';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const db = await getDb();
  const user = await db.collection('users').findOne({ _id: session.user.id });

  return user;
}
