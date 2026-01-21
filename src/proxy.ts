import { auth } from "./auth";
 
export function proxy(req) {
  // req.auth is available here
  console.log("ROUTE: ", req.nextUrl.pathname);
  console.log("AUTH OBJECT: ", req.auth);
  return auth(req);
}
 
// Optionally, don't invoke Proxy on some paths
export const config = {
  matcher: ["/admin/:path*"],
};