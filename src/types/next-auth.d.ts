import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      accountId: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accountId?: number;
  }
}
