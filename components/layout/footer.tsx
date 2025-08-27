import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">NexTicket</h3>
            <p className="text-gray-400">
              Your premier destination for event tickets and venue management.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-blue-500 cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-pink-500 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Quick Links</h4>
            <div className="flex flex-col space-y-2">
              <Link href="/events" className="text-gray-400 hover:text-white transition-colors">
                Browse Events
              </Link>
              <Link href="/venues" className="text-gray-400 hover:text-white transition-colors">
                Find Venues
              </Link>
              <Link href="/organizer/dashboard" className="text-gray-400 hover:text-white transition-colors">
                Organizer Dashboard
              </Link>
              <Link href="/auth/signup" className="text-gray-400 hover:text-white transition-colors">
                Become an Organizer
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Support</h4>
            <div className="flex flex-col space-y-2">
              <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                Help Center
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact Us
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Contact</h4>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">support@nexticket.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">+94 1234 5678</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} NexTicket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
