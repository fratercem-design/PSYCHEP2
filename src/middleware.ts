import { auth } from "./auth";
 
export default auth((req) => {
  // req.auth is available here
  console.log("ROUTE: ", req.nextUrl.pathname);
  console.log("AUTH OBJECT: ", req.auth);
});
 
// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/admin/:path*"],
};