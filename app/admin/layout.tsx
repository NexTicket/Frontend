'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (firebaseUser && userProfile?.role !== 'admin') {
      router.replace('/'); // redirect non-admins
    }
  }, [firebaseUser, userProfile]);

  if (!firebaseUser || userProfile?.role !== 'admin') {
    return <p>Checking permissions...</p>; 
  }

  return <>{children}</>;
}
