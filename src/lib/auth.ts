import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { verifyAccountPassword } from "@/lib/services/accounts";

const CredentialsSchema = z.object({
  name: z.string().min(1),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Account",
      credentials: {
        name: { label: "Account name", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = CredentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const account = await verifyAccountPassword(
          parsed.data.name,
          parsed.data.password,
        );
        if (!account) return null;
        return {
          id: String(account.id),
          name: account.name,
          email: account.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accountId = Number(user.id);
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accountId != null) {
        session.user.id = String(token.accountId);
        session.user.accountId = token.accountId as number;
      }
      return session;
    },
  },
});
