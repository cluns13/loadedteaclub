import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

// Create the handler
const handler = NextAuth(authOptions);

// Export the handler functions
export const GET = handler;
export const POST = handler;

// Extend the default User type
declare module 'next-auth' {
  interface User {
    id: string;
    globalCustomerId?: string;
    isClubOwner?: boolean;
    role?: string;
  }

  interface Session {
    user: User & {
      id: string;
      globalCustomerId?: string;
      isClubOwner?: boolean;
      role?: string;
    }
  }
}
