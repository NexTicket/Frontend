"use client"
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { ProfileDropdown } from '@/components/ui/profile-dropdown';
import { 
  Calendar, 
  MapPin, 
  Menu,
  X,
  Building,
  Users,
  Settings,
  Crown,
  QrCode,
  Sparkles
} from 'lucide-react';
import { useState,useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { userProfile } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getRoleSpecificLinks = () => {
    if (!userProfile) return [];
    
    switch (userProfile.role) {
      case 'organizer':
        return [
          { href: '/organizer/dashboard', label: 'Dashboard', icon: Crown }
          // { href: '/organizer/events', label: 'My Events', icon: Calendar }
        ];
      case 'venue_owner':
        return [
          { href: '/venue-owner/dashboard', label: 'Dashboard', icon: Building },
          { href: '/venue-owner/venues', label: 'My Venues', icon: MapPin }
        ];
      case 'admin':
        return [
          { href: '/admin/dashboard', label: 'Admin Panel', icon: Settings },
          { href: '/admin/staff', label: 'Manage Staff', icon: Calendar },
          { href: '/admin/users', label: 'Manage Users', icon: Users }
        ];
      // case 'checkin_officer':
      //   return [
      //     { href: '/checkin/dashboard', label: 'Check-in Dashboard', icon: QrCode },
      //   ];
      default:
        return [];
    }
  };

  const roleLinks = getRoleSpecificLinks();

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-background/80 backdrop-blur-lg border-b shadow-lg' 
        : 'bg-background border-b'
    }`} style={{ backgroundColor: '#191C24', borderColor: '#191C24' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary">
            NexTicket
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Public Navigation */}
            <Link href="/events" className="group flex items-center px-4 py-2 rounded-lg text-white hover:text-primary hover:bg-primary/5 transition-all duration-200">
              <Calendar className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Events
            </Link>
            <Link href="/venues" className="group flex items-center px-4 py-2 rounded-lg text-white hover:text-primary hover:bg-primary/5 transition-all duration-200">
              <MapPin className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Venues
            </Link>
            
            {/* Role-specific Navigation */}
            {roleLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="group flex items-center px-4 py-2 rounded-lg text-white hover:text-primary hover:bg-primary/5 transition-all duration-200"
                >
                  <Icon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  {link.label}
                </Link>
              );
            })}

            {/* Right side items */}
            <div className="flex items-center space-x-3 ml-6">
              <ThemeToggle />
              <ProfileDropdown />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            <ThemeToggle />
            <ProfileDropdown size="sm" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative group"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
              ) : (
                <Menu className="h-6 w-6 text-foreground group-hover:text-primary transition-colors" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t bg-background/95 backdrop-blur-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Public Navigation */}
              <Link
                href="/events"
                className="group flex items-center px-3 py-3 rounded-lg text-white hover:text-primary hover:bg-primary/5 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <Calendar className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform text-white" />
                Events
              </Link>
              <Link
                href="/venues"
                className="group flex items-center px-3 py-3 rounded-lg text-white hover:text-primary hover:bg-primary/5 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <MapPin className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform text-white" />
                Venues
              </Link>
              {/* Role-specific Navigation */}
              {roleLinks.length > 0 && (
                <>
                  <div className="border-t pt-3 mt-3">
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {userProfile?.role?.replace('_', ' ')} Dashboard
                    </p>
                  </div>
                  {roleLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link 
                        key={link.href}
                        href={link.href}
                        className="group flex items-center px-3 py-3 rounded-lg text-white hover:text-primary hover:bg-primary/5 transition-all duration-200"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform text-white" />
                        {link.label}
                      </Link>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
