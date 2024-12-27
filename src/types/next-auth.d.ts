import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      globalCustomerId?: string | null;
      isClubOwner?: boolean;
    }
  }

  interface User {
    id: string;
    globalCustomerId?: string;
    isClubOwner?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    globalCustomerId?: string;
    isClubOwner?: boolean;
  }
}
