'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { useEffect } from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if user is authenticated and they're not explicitly trying to sign out
    if (firebaseUser) {
      // Allow users to access auth pages if they want to switch accounts or sign up a new account
      // Only redirect if they're trying to sign in with an existing account
      if (pathname === '/auth/signin') {
        router.replace('/'); // redirect to home or dashboard
      }
      // Don't redirect on signup page - they might want to create a new account
    }
  }, [firebaseUser, pathname, router]);

  return <>{children}</>;
}
