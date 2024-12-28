import "next-auth";
import { type DefaultSession, type DefaultUser } from "next-auth";
import { type DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: 'USER' | 'BUSINESS_OWNER' | 'ADMIN';
    isClubOwner?: boolean;
    globalCustomerId?: string | null;
  }

  interface Session extends DefaultSession {
    user: User & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: 'USER' | 'BUSINESS_OWNER' | 'ADMIN';
    isClubOwner: boolean;
    globalCustomerId: string | null;
  }
}
