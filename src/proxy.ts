import { auth } from "./auth";
import { NextRequest } from "next/server";
 
export function proxy(req: NextRequest) {
  // req.auth is available here
  console.log("ROUTE: ", req.nextUrl.pathname);
  console.log("AUTH OBJECT: ", (req as any).auth);
  return auth(req as any);
}
 
// Optionally, don't invoke Proxy on some paths
export const config = {
  matcher: ["/admin/:path*"],
};