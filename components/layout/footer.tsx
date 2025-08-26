import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-background border-t" style={{ backgroundColor: '#191C24', borderColor: '#191C24' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">NexTicket</h3>
            <p className="text-muted-foreground">
              Your premier destination for event tickets and venue management.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Twitter className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" />
              <Instagram className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              <Link href="/events" className="text-muted-foreground hover:text-primary">
                Browse Events
              </Link>
              <Link href="/venues" className="text-muted-foreground hover:text-primary">
                Find Venues
              </Link>
              <Link href="/organizer/dashboard" className="text-muted-foreground hover:text-primary">
                Organizer Dashboard
              </Link>
              <Link href="/auth/signup" className="text-muted-foreground hover:text-primary">
                Become an Organizer
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold">Support</h4>
            <div className="flex flex-col space-y-2">
              <Link href="/help" className="text-muted-foreground hover:text-primary">
                Help Center
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-primary">
                Contact Us
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-primary">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold">Contact</h4>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">support@nexticket.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">+94 1234 5678</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} NexTicket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
