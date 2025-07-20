'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (firebaseUser && userProfile?.role !== 'organizer') {
      router.replace('/');
    }
  }, [firebaseUser, userProfile]);

  if (!firebaseUser || userProfile?.role !== 'organizer') {
    return <p>Checking permissions...</p>;
  }

  return <>{children}</>;
}
