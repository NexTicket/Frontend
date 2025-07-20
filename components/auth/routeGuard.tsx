'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { useEffect, useState } from 'react';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'organizer' | 'customer';
}

export default function RouteGuard({ children, requiredRole }: RouteGuardProps) {
  const { firebaseUser, userProfile } = useAuth();
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    // Don't do anything until auth state is ready
    if (firebaseUser === undefined || userProfile === undefined) return;

    if (!firebaseUser || !userProfile) {
      router.push('/auth/signin?message=login-required');
      return;
    }

    if (requiredRole && userProfile.role !== requiredRole && userProfile.role !== 'admin') {
      router.push('/auth/signin?message=unauthorized');
      return;
    }

    setIsAllowed(true);
  }, [firebaseUser, userProfile, requiredRole]);

  if (!isAllowed) return null;

  return <>{children}</>;
}
