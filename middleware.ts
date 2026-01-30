import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware for the drone fleet management application.
 *
 * Currently handles:
 * - Root path redirect to /fleet
 * - Security headers (CSP, XSS protection, etc.)
 * - Request logging in development mode
 *
 * Future considerations:
 * - Authentication checks (when auth is implemented)
 * - Rate limiting
 * - API key validation for external access
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root to /fleet
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/fleet", request.url));
  }

  // Add security headers to all responses
  const response = NextResponse.next();

  // Content Security Policy
  // Note: Relaxed for Mapbox GL JS requirements
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com blob:",
      "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
      "img-src 'self' data: blob: https://*.mapbox.com",
      "font-src 'self'",
      "connect-src 'self' https://*.mapbox.com https://api.mapbox.com https://events.mapbox.com",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "frame-ancestors 'none'",
    ].join("; ")
  );

  // XSS Protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), interest-cohort=()"
  );

  return response;
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
