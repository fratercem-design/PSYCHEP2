import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { isAllowedAdminEmail } from "@/lib/auth-utils";

export const authConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    Google,
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Use environment variables for admin credentials
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminEmail = process.env.ADMIN_FALLBACK_EMAIL;
        
        if (credentials?.username === adminUsername && credentials?.password === adminPassword) {
          return {
            id: "1",
            name: "Admin",
            // Fallback email must be set in env vars to work with allowlist
            email: adminEmail || "admin-fallback@localhost",
            role: "admin",
            staffId: 1
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      // Only allow sign-in if email is allowlisted
      return isAllowedAdminEmail(user?.email);
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        // @ts-expect-error -- session.user is not extended with role
        session.user.role = token.role;
        // @ts-expect-error -- session.user is not extended with staffId
        session.user.staffId = token.staffId;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // @ts-expect-error - role is a custom property
        token.role = user.role;
        // @ts-expect-error - staffId is a custom property
        token.staffId = user.staffId;
      }
      return token;
    },
  },
} satisfies NextAuthConfig;
