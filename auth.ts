import "@/lib/env";
import CredentialsProvider from "next-auth/providers/credentials";
import { type NextAuthOptions } from "next-auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isBlocked, recordFailure, recordSuccess } from "@/lib/rateLimit";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        const identifier = credentials.email.trim().toLowerCase();

        try {
          if (await isBlocked(identifier)) {
            throw new Error("Too many attempts");
          }
        } catch (e) {
          if (e instanceof Error && e.message === "Too many attempts") {
            throw e;
          }
          // Fail open on rate-limit infrastructure errors.
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          try {
            await recordFailure(identifier);
          } catch {}
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          try {
            await recordFailure(identifier);
          } catch {}
          throw new Error("Invalid credentials");
        }

        try {
          await recordSuccess(identifier);
        } catch {}

        return user;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        let dbUser: {
          id: string;
          name: string | null;
          email: string;
          sessionVersion: number;
        } | null = null;
        try {
          dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
              id: true,
              name: true,
              email: true,
              sessionVersion: true,
            },
          });
        } catch {
          dbUser = null;
        }
        if (!dbUser) return {};
        return {
          ...token,
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          sessionVersion: dbUser.sessionVersion,
        };
      }

      if (token.id) {
        let dbUser: {
          name: string | null;
          email: string;
          sessionVersion: number;
        } | null = null;
        try {
          dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { name: true, email: true, sessionVersion: true },
          });
        } catch {
          dbUser = null;
        }
        if (!dbUser || dbUser.sessionVersion !== token.sessionVersion) {
          return {};
        }
        return {
          ...token,
          name: dbUser.name,
          email: dbUser.email,
          sessionVersion: dbUser.sessionVersion,
        };
      }

      return token;
    },
    async session({ session, token }) {
      if (!token.id) {
        return { ...session, user: {} };
      }
      return {
        ...session,
        user: {
          id: token.id as string,
          name: (token.name as string) ?? null,
          email: (token.email as string) ?? null,
        },
      };
    },
  },
} satisfies NextAuthOptions;
