import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnAdmin = req.nextUrl.pathname.startsWith("/admin");
  
  // @ts-ignore
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