import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [Google],
  callbacks: {
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
