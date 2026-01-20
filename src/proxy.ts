import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnAdmin = req.nextUrl.pathname.startsWith("/admin");
  
  // @ts-expect-error - req.auth is not extended with user
  const isStaff = req.auth?.user?.role === "admin" || req.auth?.user?.role === "mod";

  if (isOnAdmin) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/signin", req.nextUrl));
    }
    if (!isStaff) {
      return NextResponse.redirect(new URL("/", req.nextUrl)); // Redirect unauthorized users
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
