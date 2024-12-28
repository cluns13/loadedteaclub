import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import { compare } from 'bcryptjs';
import { getDb } from '@/lib/db/mongodb';
import { User } from '@/types/models';
import { WithId } from '@/types/database';

// Extend the session type to include additional user properties
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      role: 'USER' | 'BUSINESS_OWNER' | 'ADMIN';
      isClubOwner: boolean;
      globalCustomerId: string | null;
    }
  }

  interface User {
    id: string;
    role: 'USER' | 'BUSINESS_OWNER' | 'ADMIN';
    isClubOwner: boolean;
    globalCustomerId: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'USER' | 'BUSINESS_OWNER' | 'ADMIN';
    isClubOwner: boolean;
    globalCustomerId: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const db = await getDb();
        const user = await db.collection<User>('users').findOne({
          email: credentials.email.toLowerCase()
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.hashedPassword
        );

        return isPasswordValid ? {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role || 'USER',
          isClubOwner: user.isClubOwner || false,
          globalCustomerId: user.globalCustomerId || null,
        } : null;
      },
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      return true; // Always allow sign-in
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? 'USER';
        token.isClubOwner = user.isClubOwner ?? false;
        token.globalCustomerId = user.globalCustomerId ?? null;
        token.name = user.name ?? null;
        token.email = user.email ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? '';
        session.user.role = token.role ?? 'USER';
        session.user.isClubOwner = token.isClubOwner ?? false;
        session.user.globalCustomerId = token.globalCustomerId ?? null;
        session.user.name = token.name ?? null;
        session.user.email = token.email ?? null;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || ''
};
