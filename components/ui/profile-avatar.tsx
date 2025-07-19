"use client"

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/components/auth/auth-provider';
import { User } from 'lucide-react';

interface ProfileAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  showDropdown?: boolean;
}

export function ProfileAvatar({ size = 'md', showDropdown = false }: ProfileAvatarProps) {
  const { user } = useAuth();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  if (user) {
    return (
      <div className="relative">
        <Link href="/profile" className="block">
          <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer`}>
            <Image
              src={user.profilePicture || "/Images/profile-avatar-account-icon.png"}
              alt={`${user.firstName} ${user.lastName}`}
              width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
              height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-card border rounded-lg shadow-lg py-2 z-50">
            <div className="px-4 py-2 border-b">
              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-secondary">
              Profile
            </Link>
            {user.role === 'admin' && (
              <Link href="/admin/dashboard" className="block px-4 py-2 text-sm hover:bg-secondary">
                Admin Dashboard
              </Link>
            )}
            {user.role === 'organizer' && (
              <Link href="/organizer/dashboard" className="block px-4 py-2 text-sm hover:bg-secondary">
                Organizer Dashboard
              </Link>
            )}
          </div>
        )}
      </div>
    );
  }

  // Empty profile circle for unauthenticated users
  return (
    <Link href="/auth/signin" className="block">
      <div className={`${sizeClasses[size]} rounded-full bg-muted hover:bg-muted/80 border-2 border-border hover:border-primary/40 transition-colors cursor-pointer flex items-center justify-center`}>
        <User className="w-5 h-5 text-muted-foreground" />
      </div>
    </Link>
  );
}
