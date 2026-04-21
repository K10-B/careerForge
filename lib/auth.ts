import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PlanTier } from "@prisma/client";
import { compare } from "bcryptjs";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { getBillingSnapshotForUser } from "@/lib/billing";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id: string; planTier: PlanTier };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    planTier?: PlanTier;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user?.password) {
          throw new Error("No account found for that email.");
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Incorrect password.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          planTier: user.planTier,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.planTier = (user as { planTier?: PlanTier }).planTier;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        try {
          const billing = await getBillingSnapshotForUser(token.id as string);
          session.user.planTier = billing.planTier;
        } catch {
          session.user.planTier = token.planTier ?? "FREE";
        }
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};

export function auth() {
  return getServerSession(authOptions);
}
