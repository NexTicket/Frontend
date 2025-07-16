"use client"

import Link from 'next/link';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { 
  Calendar, 
  MapPin, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

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
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.firstName} ({user.role})
                </span>
                <Link href="/profile" className="text-foreground hover:text-primary transition-colors">
                  <User className="w-4 h-4 inline mr-2" />
                  Profile
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin/dashboard" className="text-foreground hover:text-primary transition-colors">
                    <Settings className="w-4 h-4 inline mr-2" />
                    Admin Dashboard
                  </Link>
                )}
                {user.role === 'organizer' && (
                  <Link href="/organizer/dashboard" className="text-foreground hover:text-primary transition-colors">
                    <Settings className="w-4 h-4 inline mr-2" />
                    Organizer Dashboard
                  </Link>
                )}
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
            
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
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
              
              {user ? (
                <>
                  <div className="text-sm text-muted-foreground py-2">
                    Welcome, {user.firstName} ({user.role})
                  </div>
                  <Link href="/profile" className="text-foreground hover:text-primary transition-colors">
                    <User className="w-4 h-4 inline mr-2" />
                    Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin/dashboard" className="text-foreground hover:text-primary transition-colors">
                      <Settings className="w-4 h-4 inline mr-2" />
                      Admin Dashboard
                    </Link>
                  )}
                  {user.role === 'organizer' && (
                    <Link href="/organizer/dashboard" className="text-foreground hover:text-primary transition-colors">
                      <Settings className="w-4 h-4 inline mr-2" />
                      Organizer Dashboard
                    </Link>
                  )}
                  <Button onClick={handleLogout} variant="ghost" size="sm" className="justify-start">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="sm" className="w-full justify-start">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
