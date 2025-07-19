'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  firebaseSignIn,
  firebaseSignUp,
  firebaseLogout,
} from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextProps {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // 🔁 Track Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe(); // cleanup on unmount
  }, []);

  // 🔐 Sign In
  const signIn = async (email: string, password: string) => {
    await firebaseSignIn(email, password);
    setUser(auth.currentUser);
  };

  // 🔐 Sign Up
  const signUp = async (email: string, password: string) => {
    await firebaseSignUp(email, password);
    setUser(auth.currentUser);
  };

  // 🔐 Logout
  const logout = async () => {
    await firebaseLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
