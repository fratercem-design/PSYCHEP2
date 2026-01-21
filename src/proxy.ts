import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";
 
// Proxy function for Next.js 16 - handles authentication for admin routes
export async function proxy(req: NextRequest) {
  // Get the auth session
  const session = await auth();
  console.log("ROUTE: ", req.nextUrl.pathname);
  console.log("SESSION: ", session);
  
  // Check if user is authenticated
  if (!session) {
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