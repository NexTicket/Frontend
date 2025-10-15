'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fetchEventsByOrganizer } from '@/lib/api';
import { Loading } from '@/components/ui/loading';

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, userProfile, isLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

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
      } else if (userProfile && userProfile.role === 'organizer') {
        // Fetch events for this organizer
        const fetchOrganizerEvents = async () => {
          setEventsLoading(true);
          try {
            // Use the proper API function that goes through API Gateway with authentication
            const response = await fetchEventsByOrganizer(firebaseUser.uid);
            const events = Array.isArray(response?.data) ? response.data : [];
            setEvents(events);
          } catch (error) {
            setEvents([]);
            console.error('Failed to fetch organizer events:', error);
          } finally {
            setEventsLoading(false);
          }
        };
        fetchOrganizerEvents();
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
  if (!firebaseUser || !userProfile || userProfile.role !== 'organizer') {
    return null;
  }

  return <>{children}</>;
}
