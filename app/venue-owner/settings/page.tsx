'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Building2,
  Mail,
  Phone
} from 'lucide-react';

export default function VenueOwnerSettings() {
  return (
    <div className="p-8 bg-gradient-to-br from-background to-muted/20 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Profile Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card/50 backdrop-blur-sm rounded-xl border p-6"
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <User className="h-6 w-6 mr-3 text-primary" />
              Profile Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Your company name"
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <Button className="bg-gradient-to-r from-primary to-purple-600">
                Update Profile
              </Button>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card/50 backdrop-blur-sm rounded-xl border p-6"
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Bell className="h-6 w-6 mr-3 text-primary" />
              Notification Preferences
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Event Bookings</h3>
                  <p className="text-sm text-muted-foreground">Get notified when someone books your venue</p>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Payment Updates</h3>
                  <p className="text-sm text-muted-foreground">Receive updates about payments and payouts</p>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Marketing Updates</h3>
                  <p className="text-sm text-muted-foreground">Receive tips and promotional content</p>
                </div>
                <input type="checkbox" className="toggle" />
              </div>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card/50 backdrop-blur-sm rounded-xl border p-6"
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Shield className="h-6 w-6 mr-3 text-primary" />
              Security
            </h2>
            
            <div className="space-y-4">
              <div>
                <Button variant="outline" className="w-full md:w-auto">
                  Change Password
                </Button>
              </div>
              
              <div>
                <Button variant="outline" className="w-full md:w-auto">
                  Enable Two-Factor Authentication
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Billing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card/50 backdrop-blur-sm rounded-xl border p-6"
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <CreditCard className="h-6 w-6 mr-3 text-primary" />
              Billing & Payments
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-background/50">
                <h3 className="font-medium mb-2">Current Plan: Professional</h3>
                <p className="text-sm text-muted-foreground">$49/month • Up to 10 venues</p>
              </div>
              
              <div className="flex space-x-4">
                <Button variant="outline">
                  Update Payment Method
                </Button>
                <Button variant="outline">
                  View Billing History
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
