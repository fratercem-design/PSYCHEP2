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

      // Check if user is in staff_users table
      const staff = await db.query.staffUsers.findFirst({
        where: eq(staffUsers.email, user.email),
      });

      if (staff) {
        // Add role to user object for session callback
        // @ts-ignore
        user.role = staff.role;
        // @ts-ignore
        user.staffId = staff.id;
        return true;
      }

      return false; // Deny access if not staff
    },
    async session({ session, token }) {
      if (session.user && token.role) {
        // @ts-ignore
        session.user.role = token.role;
        // @ts-ignore
        session.user.staffId = token.staffId;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.role = user.role;
        // @ts-ignore
        token.staffId = user.staffId;
      }
      return token;
    },
  },
});
