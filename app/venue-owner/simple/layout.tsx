'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  LayoutDashboard, 
  Plus, 
  Settings
} from 'lucide-react';

export default function VenueOwnerLayoutSimple({ children }: { children: React.ReactNode }) {
  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/venue-owner/simple/dashboard' },
    { icon: Building2, label: 'My Venues', href: '/venue-owner/simple/venues' },
    { icon: Plus, label: 'Create Venue', href: '/venue-owner/simple/venues/new' },
    { icon: Settings, label: 'Settings', href: '/venue-owner/simple/settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-border">
            <Building2 className="h-8 w-8 text-primary mr-3" />
            <span className="text-xl font-bold">VenueHub (Test)</span>
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
            <div className="text-sm text-muted-foreground">
              Test Mode - Authentication Bypassed
            </div>
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
