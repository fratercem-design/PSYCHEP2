import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
import { isAllowedAdminEmail } from "@/lib/auth-utils";
 
// Proxy function for Next.js 16 - handles authentication for admin routes
export async function proxy(req: NextRequest) {
  // Get the auth session
  const session = await auth();
  console.log("ROUTE: ", req.nextUrl.pathname);
  console.log("SESSION: ", session);
  
  // Check if user is authenticated
  if (!session) {
    // Redirect to signin page if not authenticated
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // Double check allowlist (in case session exists but email is not allowed)
  if (!isAllowedAdminEmail(session.user?.email)) {
    // Redirect to home or show 403
    return NextResponse.redirect(new URL("/", req.url));
  }
  
  // Return null to continue with the request if authenticated
  return null;
}
 
// Optionally, don't invoke Proxy on some paths
export const config = {
  matcher: ["/admin/:path*"],
};
