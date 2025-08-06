'use client';

import React from 'react';
import { useAuth } from '@/components/auth/auth-provider';

export default function VenueOwnerDebug() {
  const { firebaseUser, userProfile, isLoading } = useAuth();

  return (
    <div className="p-8 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Venue Owner Debug Page</h1>
        
        <div className="bg-card p-6 rounded-lg border space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
              <p><strong>Firebase User:</strong> {firebaseUser ? 'Logged in' : 'Not logged in'}</p>
              <p><strong>User Email:</strong> {firebaseUser?.email || 'N/A'}</p>
              <p><strong>User Profile:</strong> {userProfile ? 'Loaded' : 'Not loaded'}</p>
              <p><strong>User Role:</strong> {userProfile?.role || 'N/A'}</p>
              <p><strong>Display Name:</strong> {userProfile?.displayName || 'N/A'}</p>
            </div>
          </div>

          {firebaseUser && (
            <div>
              <h2 className="text-xl font-semibold mb-2">Firebase User Details</h2>
              <pre className="bg-muted p-4 rounded text-xs overflow-auto">
                {JSON.stringify({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  emailVerified: firebaseUser.emailVerified,
                  displayName: firebaseUser.displayName
                }, null, 2)}
              </pre>
            </div>
          )}

          {userProfile && (
            <div>
              <h2 className="text-xl font-semibold mb-2">User Profile Details</h2>
              <pre className="bg-muted p-4 rounded text-xs overflow-auto">
                {JSON.stringify(userProfile, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
            <div className="space-x-4">
              <button 
                onClick={() => window.location.href = '/venue-owner/dashboard'}
                className="px-4 py-2 bg-primary text-primary-foreground rounded"
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => window.location.href = '/venue-owner/venues'}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded"
              >
                Go to Venues
              </button>
              <button 
                onClick={() => window.location.href = '/venue-owner/venues/new'}
                className="px-4 py-2 bg-accent text-accent-foreground rounded"
              >
                Create Venue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
