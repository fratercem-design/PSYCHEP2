import NextAuth from "next-auth";
import { db } from "./db";
import { staffUsers } from "./db/schema";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Allow credentials provider to bypass staff check
      if (account?.provider === "credentials") {
        return true;
      }

      if (!user.email) return false;

      try {
        // Check if user is in staff_users table
        const staff = await db.query.staffUsers.findFirst({
          where: eq(staffUsers.email, user.email),
        });

        if (staff) {
          // Add role to user object for session callback
          // @ts-expect-error - custom property
          user.role = staff.role;
          // @ts-expect-error - staffId is a custom property
          user.staffId = staff.id;
          return true;
        }
      } catch (error) {
        console.error("Database error during sign in:", error);
        return false;
      }

      return false; // Deny access if not staff
    },
  },
});
