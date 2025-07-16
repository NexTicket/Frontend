"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { MockUser, findUserByCredentials, getUserById } from '@/lib/mock-users';

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUserId = localStorage.getItem('nexticket_user_id');
    if (storedUserId) {
      const storedUser = getUserById(storedUserId);
      if (storedUser) {
        setUser(storedUser);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const foundUser = findUserByCredentials(email, password);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('nexticket_user_id', foundUser.id);
      } else {
        throw new Error('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      // For now, just throw an error since we're using hardcoded users
      throw new Error('Sign up is not available in demo mode. Please use existing credentials.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('nexticket_user_id');
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
