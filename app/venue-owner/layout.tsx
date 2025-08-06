'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  LayoutDashboard, 
  Plus, 
  Settings, 
  Bell,
  User,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VenueOwnerLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, userProfile, isLoading, logout } = useAuth();
  const router = useRouter();

  
  
  useEffect(() => {
    if (!isLoading) {
      if (!firebaseUser) {
        router.replace('/');
      } else if (userProfile && userProfile.role !== 'venue_owner') {
        router.replace('/');
      }
    }
  }, [firebaseUser, userProfile, isLoading, router]);
  

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

  if (!firebaseUser || (userProfile && userProfile.role !== 'venue_owner')) {
    return null;
  }

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/venue-owner/dashboard' },
    { icon: Building2, label: 'My Venues', href: '/venue-owner/venues' },
    { icon: Plus, label: 'Create Venue', href: '/venue-owner/venues/new' },
    { icon: Settings, label: 'Settings', href: '/venue-owner/settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-border">
            <Building2 className="h-8 w-8 text-primary mr-3" />
            <span className="text-xl font-bold">VenueHub</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors group"
              >
                <item.icon className="h-5 w-5 mr-3 text-muted-foreground group-hover:text-foreground" />
                <span className="group-hover:text-foreground">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t border-border p-4">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{userProfile?.displayName || 'Venue Owner'}</p>
                <p className="text-xs text-muted-foreground">{userProfile?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <div className="min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
