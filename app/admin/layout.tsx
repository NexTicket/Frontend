'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loading } from '@/components/ui/loading';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, userProfile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading and have a clear auth state
    if (!isLoading) {
      if (!firebaseUser) {
        // User is not authenticated, redirect to home
        console.log("Admin Layout: No user authenticated, redirecting to home");
        router.replace('/');
      } else if (userProfile && userProfile.role !== 'admin') {
        // User is authenticated but not an admin, redirect to home
        console.log("Admin Layout: User is not admin, redirecting to home");
        router.replace('/');
      }
    }
  }, [firebaseUser, userProfile, isLoading, router]);

    // Show loading while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading
          size="md"
          text="Loading..."
        />
      </div>
    );
  }

  // Show checking permissions only if user exists but profile is still loading
  if (firebaseUser && !userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading
          size="md"
          text="Checking permissions..."
        />
      </div>
    );
  }

  // If no user or wrong role, don't render anything (useEffect will handle redirect)
  if (!firebaseUser || !userProfile || userProfile.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
