import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
 
// Proxy function for Next.js 16 - handles authentication for admin routes
export function proxy(req: NextRequest) {
  // req.auth is available here - fixed TypeScript type annotation
  console.log("ROUTE: ", req.nextUrl.pathname);
  console.log("AUTH OBJECT: ", (req as any).auth);
  
  // Check if user is authenticated
  if (!(req as any).auth) {
    // Redirect to login page if not authenticated
    return NextResponse.redirect(new URL("/login", req.url));
  }
  
  // Return null to continue with the request if authenticated
  return null;
}
 
// Optionally, don't invoke Proxy on some paths
export const config = {
  matcher: ["/admin/:path*"],
};