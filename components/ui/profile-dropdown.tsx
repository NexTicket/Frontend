"use client"

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

interface ProfileDropdownProps {
  size?: 'sm' | 'md' | 'lg';
}

export function ProfileDropdown({ size = 'md' }: ProfileDropdownProps) {
  const { userProfile, firebaseUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (firebaseUser && userProfile) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 hover:bg-secondary/50 rounded-lg p-1 transition-colors"
        >
          <div className={`${sizeClasses[size]} rounded-full overflow-hidden border border-primary/20 hover:border-primary/40 transition-colors`}>
            <Image
              src="/Images/profile-avatar-account-icon.png"
              alt={`${userProfile.firstName || 'User'} ${userProfile.lastName || ''}`}
              width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
              height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
              className="w-full h-full object-cover"
            />
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-card border rounded-lg shadow-lg py-2 z-50">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-medium text-card-foreground">
                {userProfile.firstName || userProfile.displayName || 'User'} {userProfile.lastName || ''}
              </p>
              <p className="text-xs text-muted-foreground">{userProfile.email}</p>
              <p className="text-xs text-primary capitalize font-medium">{userProfile.role}</p>
            </div>
            
            <div className="py-2">
              <Link 
                href="/profile" 
                className="flex items-center px-4 py-2 text-sm hover:bg-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4 mr-3" />
                Profile
              </Link>
              
              {userProfile.role === 'admin' && (
                <Link 
                  href="/admin/dashboard" 
                  className="flex items-center px-4 py-2 text-sm hover:bg-secondary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Admin Dashboard
                </Link>
              )}
              
              {userProfile.role === 'organizer' && (
                <Link 
                  href="/organizer/dashboard" 
                  className="flex items-center px-4 py-2 text-sm hover:bg-secondary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Organizer Dashboard
                </Link>
              )}
            </div>
            
            <div className="border-t pt-2">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm hover:bg-secondary transition-colors text-left"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Empty profile circle for unauthenticated users
  return (
    <Link href="/auth/signin" className="block">
      <div className={`${sizeClasses[size]} rounded-full bg-muted hover:bg-muted/80 border border-border hover:border-primary/40 transition-colors cursor-pointer flex items-center justify-center`}>
        <User className="w-5 h-5 text-muted-foreground" />
      </div>
    </Link>
  );
}
