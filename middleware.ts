import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Export the middleware function properly
export function middleware(request: NextRequest) {
  // Skip the middleware check for the setup page and static assets
  if (
    request.nextUrl.pathname.startsWith("/setup") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.includes(".") || // Skip static files
    request.nextUrl.pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Check if API credentials are present in cookies
  const apiUserId = request.cookies.get("api_user_id");
  const apiKey = request.cookies.get("api_key");

  // If credentials are missing, redirect to setup page
  if (!apiUserId || !apiKey) {
    const url = request.nextUrl.clone();
    url.pathname = "/setup";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// See: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /setup (setup page)
     * 4. All static files (e.g. favicon, images, fonts, etc.)
     */
    "/((?!api|_next|setup|.*\\.).*)",
  ],
};
