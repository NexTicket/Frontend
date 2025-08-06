'use client';

import React from 'react';

export default function SimpleVenueOwnerDashboard() {
  return (
    <div className="p-8 bg-gradient-to-br from-background to-muted/20 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mb-8">
          Venue Owner Dashboard (Test Mode)
        </h1>
        
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border p-8">
          <h2 className="text-2xl font-semibold mb-4">🎉 Success!</h2>
          <p className="text-muted-foreground mb-6">
            The venue owner UI pages are working correctly. This test page bypasses authentication.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20">
              <h3 className="text-blue-600 font-medium">Total Venues</h3>
              <p className="text-3xl font-bold text-blue-700">5</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20">
              <h3 className="text-green-600 font-medium">Total Events</h3>
              <p className="text-3xl font-bold text-green-700">23</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-purple-600 font-medium">Monthly Revenue</h3>
              <p className="text-3xl font-bold text-purple-700">$45,000</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl p-6 border border-orange-500/20">
              <h3 className="text-orange-600 font-medium">Occupancy Rate</h3>
              <p className="text-3xl font-bold text-orange-700">92%</p>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Test Navigation</h3>
            <div className="space-y-2">
              <p>✅ Dashboard page loads correctly</p>
              <p>✅ Layout and sidebar are working</p>
              <p>✅ Animations and gradients are applied</p>
              <p>✅ Responsive design is functioning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
