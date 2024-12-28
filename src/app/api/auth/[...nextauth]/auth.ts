import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { getDb } from '@/lib/db/mongodb';
import type { User } from '@/types/models';
import { JWT } from 'next-auth/jwt';
import { Session } from 'next-auth';

// Extend the default types to include role and isAdmin
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'USER' | 'BUSINESS_OWNER' | 'ADMIN';
      isAdmin: boolean;
      isClubOwner?: boolean;
    }
  }

  interface User {
    role: 'USER' | 'BUSINESS_OWNER' | 'ADMIN';
    isAdmin: boolean;
    isClubOwner?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'USER' | 'BUSINESS_OWNER' | 'ADMIN';
    isAdmin: boolean;
    isClubOwner?: boolean;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const db = await getDb();
        const user = await db.collection('users').findOne({
          email: credentials.email.toLowerCase()
        }) as User | null;

        if (!user) {
          throw new Error('No user found with this email');
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          isAdmin: user.role === 'ADMIN',
          isClubOwner: user.isClubOwner,
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.isAdmin = user.role === 'ADMIN';
        token.isClubOwner = user.isClubOwner;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.isAdmin = token.isAdmin;
        session.user.isClubOwner = token.isClubOwner;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET
};
