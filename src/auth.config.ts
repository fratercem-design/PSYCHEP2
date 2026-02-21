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
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminUsername = process.env.ADMIN_USERNAME;
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminEmail = process.env.ADMIN_FALLBACK_EMAIL;

        if (
          credentials?.username === adminUsername &&
          credentials?.password === adminPassword
        ) {
          return {
            id: "admin-credentials",
            name: "Admin",
            email: adminEmail || "admin-fallback@localhost",
            role: "admin",
            staffId: "admin-credentials",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Credentials provider: admin-only, must pass allowlist
      if (account?.provider === "credentials") {
        return isAllowedAdminEmail(user?.email);
      }
      // Google OAuth: open to everyone (public user registration)
      if (account?.provider === "google") {
        return true;
      }
      return false;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        // @ts-expect-error -- custom properties
        session.user.role = token.role ?? "member";
        // @ts-expect-error -- custom properties
        session.user.staffId = token.staffId;
        // @ts-expect-error -- custom properties
        session.user.username = token.username;
        // @ts-expect-error -- custom properties
        session.user.tier = token.tier;
      }
      return session;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        // @ts-expect-error - custom properties from authorize or DB
        token.role = user.role ?? "member";
        // @ts-expect-error - custom properties
        token.staffId = user.staffId;
        // @ts-expect-error - custom properties
        token.username = user.username;
        // @ts-expect-error - custom properties
        token.tier = user.tier;
      }
      // Allow session updates (e.g. after profile edit)
      if (trigger === "update") {
        // Token will be refreshed on next sign-in
      }
      return token;
    },
  },
} satisfies NextAuthConfig;
