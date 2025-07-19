// Role-based route protection and redirection
import { MockUser } from '@/lib/mock-users';

export const getDefaultRouteForRole = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'organizer':
      return '/organizer/dashboard';
    case 'customer':
      return '/';
    default:
      return '/';
  }
};

export const canAccessRoute = (user: MockUser | null, requiredRole?: string): boolean => {
  if (!user) return false;
  if (!requiredRole) return true;
  
  // Admin can access everything
  if (user.role === 'admin') return true;
  
  // Check specific role
  return user.role === requiredRole;
};

export const getWelcomeMessage = (user: MockUser): string => {
  switch (user.role) {
    case 'admin':
      return `Welcome back, ${user.firstName}! You have full administrative access.`;
    case 'organizer':
      return `Welcome back, ${user.firstName}! Ready to manage your events?`;
    case 'customer':
      return `Welcome back, ${user.firstName}! Discover amazing events near you.`;
    default:
      return `Welcome back, ${user.firstName}!`;
  }
};

// Helper function to set authentication cookies
export const setAuthCookies = (user: MockUser) => {
  if (typeof document !== 'undefined') {
    const maxAge = 60 * 60 * 24 * 7; // 7 days
    document.cookie = `user-role=${user.role}; path=/; max-age=${maxAge}`;
    document.cookie = `auth-token=authenticated; path=/; max-age=${maxAge}`;
  }
};

// Helper function to clear authentication cookies
export const clearAuthCookies = () => {
  if (typeof document !== 'undefined') {
    document.cookie = 'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};
