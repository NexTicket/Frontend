"use client"

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import { 
  Calendar, 
  MapPin, 
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary">
            NexTicket
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/events" className="text-foreground hover:text-primary transition-colors">
              <Calendar className="w-4 h-4 inline mr-2" />
              Events
            </Link>
            <Link href="/venues" className="text-foreground hover:text-primary transition-colors">
              <MapPin className="w-4 h-4 inline mr-2" />
              Venues
            </Link>
            
            <ThemeToggle />
            <ProfileDropdown />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <ProfileDropdown size="sm" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link href="/events" className="text-foreground hover:text-primary transition-colors">
                <Calendar className="w-4 h-4 inline mr-2" />
                Events
              </Link>
              <Link href="/venues" className="text-foreground hover:text-primary transition-colors">
                <MapPin className="w-4 h-4 inline mr-2" />
                Venues
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
