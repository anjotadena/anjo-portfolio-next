import { NextResponse } from 'next/server';

export function middleware() {
  const response = NextResponse.next();
  
  // Get the current environment
  const isDev = process.env.NODE_ENV === 'development';
  
  // Base CSP policy
  const cspPolicy = [
    "default-src 'self'",
    `script-src 'self' ${isDev ? "'unsafe-inline' 'unsafe-eval'" : "'unsafe-inline'"} https://gql.hashnode.com https://vercel.live https://vercel.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://gql.hashnode.com https://vercel.live https://vercel.com https://formspree.io",
    "frame-src 'self' https://vercel.live https://vercel.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://formspree.io",
  ];
  
  // Add upgrade-insecure-requests only in production
  if (!isDev) {
    cspPolicy.push("upgrade-insecure-requests");
  }
  
  // Set CSP header
  response.headers.set('Content-Security-Policy', cspPolicy.join('; '));
  
  // Set additional security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
