import NextAuth from "next-auth";
import { db } from "./db";
import { users, staffUsers } from "./db/schema";
import { eq } from "drizzle-orm";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Credentials provider: admin-only (allowlist checked in auth.config)
      if (account?.provider === "credentials") {
        return true;
      }

      // Google OAuth: open to all — upsert into users table
      if (account?.provider === "google" && user.email) {
        try {
          // Check if user already exists by email
          const existing = await db.query.users.findFirst({
            where: eq(users.email, user.email),
          });

          if (existing) {
            // Existing user — attach DB info to session
            user.id = existing.id;
            // @ts-expect-error - custom properties
            user.username = existing.username;
            // @ts-expect-error - custom properties
            user.tier = existing.tier;
          } else {
            // Create new public user
            const userId = crypto.randomUUID();
            await db.insert(users).values({
              id: userId,
              name: user.name ?? null,
              email: user.email,
              image: user.image ?? null,
              tier: "unmarked",
              psycheBalance: 0,
              reputationScore: 0,
            });
            user.id = userId;
            // @ts-expect-error - custom properties
            user.tier = "unmarked";
          }

          // Check if user is also staff (for admin panel access)
          const staff = await db.query.staffUsers.findFirst({
            where: eq(staffUsers.email, user.email),
          });
          if (staff) {
            // @ts-expect-error - custom properties
            user.role = staff.role;
            // @ts-expect-error - custom properties
            user.staffId = staff.id;
          } else {
            // @ts-expect-error - custom properties
            user.role = "member";
          }

          return true;
        } catch (error) {
          console.error("Error during user upsert:", error);
          return false;
        }
      }

      return false;
    },
  },
});
