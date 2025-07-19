import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the user is accessing admin routes
  if (pathname.startsWith('/admin')) {
    // In a real app, you would check the user's role from a JWT token or session
    // For now, we'll simulate admin check
    const isAdmin = request.cookies.get('user-role')?.value === 'admin';
    
    if (!isAdmin) {
      // Redirect to unauthorized page or login
      return NextResponse.redirect(new URL('/auth/signin?message=admin-required', request.url));
    }
  }

  // Check if the user is accessing organizer routes
  if (pathname.startsWith('/organizer')) {
    // In a real app, you would check the user's role from a JWT token or session
    const userRole = request.cookies.get('user-role')?.value;
    const isOrganizerOrAdmin = userRole === 'organizer' || userRole === 'admin';
    
    if (!isOrganizerOrAdmin) {
      // Redirect to unauthorized page or login
      return NextResponse.redirect(new URL('/auth/signin?message=organizer-required', request.url));
    }
  }

  // Check if the user is accessing protected routes
  const protectedRoutes = ['/profile', '/checkout'];
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // In a real app, you would check if the user is authenticated
    const isAuthenticated = request.cookies.get('auth-token')?.value;
    
    if (!isAuthenticated) {
      // Redirect to login page
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
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
