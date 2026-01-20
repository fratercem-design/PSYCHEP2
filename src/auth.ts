import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "./db";
import { staffUsers } from "./db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        // Check if user is in staff_users table
        const staff = await db.query.staffUsers.findFirst({
          where: eq(staffUsers.email, user.email),
        });

        if (staff) {
          // Add role to user object for session callback
          // @ts-expect-error - role is a custom property
          user.role = staff.role;
          // @ts-expect-error - staffId is a custom property
          user.staffId = staff.id;
          return true;
        }
      } catch (error) {
        // If database is not available (edge runtime), deny access
        console.error("Database error during sign in:", error);
        return false;
      }

      return false; // Deny access if not staff
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
});

// Export runtime configuration to prevent edge runtime issues
export const runtime = "nodejs";
