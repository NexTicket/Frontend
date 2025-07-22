'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, userProfile, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading and have a clear auth state
    if (!isLoading) {
      if (!firebaseUser) {
        // User is not authenticated, redirect to home
        console.log("here 1");
        router.replace('/');
      } else if (userProfile && userProfile.role !== 'organizer') {
        // User is authenticated but not an organizer, redirect to home
        console.log("here 2");
        router.replace('/');
      }
    }
  }, [firebaseUser, userProfile, isLoading, router]);

  // Show loading while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show checking permissions only if user exists but profile is still loading
  if (firebaseUser && !userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // If no user or wrong role, don't render anything (useEffect will handle redirect)
  if (!firebaseUser || !userProfile || userProfile.role !== 'organizer') {
    return null;
  }

  return <>{children}</>;
}
