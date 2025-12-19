import { NextResponse, type NextRequest } from 'next/server';
import { decodeToken } from '@/lib/auth/jwt';

// Define routes that are publicly accessible
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
];

// Define api routes that don't require auth
const publicApiRoutes = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/verify-otp',
  '/api/auth/resend-otp',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/webhooks/meta',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow access to public routes
  if (publicRoutes.some(route => pathname === route) || 
      publicApiRoutes.some(route => pathname.startsWith(route)) ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api/auth') ||
      pathname.includes('.')) {
    return NextResponse.next();
  }

  // Check for auth token in cookies
  const authToken = request.cookies.get('authToken')?.value;
  
  // If no token is found, redirect to login
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Verify token
  const payload = decodeToken(authToken);
  
  // If token is invalid or expired, redirect to login
  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('authToken');
    return response;
  }

  // Token is valid, proceed to protected route
  return NextResponse.next();
}

// Configure matcher for routes that should run the middleware
export const config = {
  matcher: [
    // Match all routes except for static files, api routes, etc.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};
