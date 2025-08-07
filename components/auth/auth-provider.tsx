'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, sendEmailVerification, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { 
  getDoc, 
  doc, 
  setDoc, 
  getFirestore, 
  serverTimestamp,
  updateDoc,
  onSnapshot 
} from 'firebase/firestore';
import { firebaseSignIn } from '@/lib/auth';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';

const db = getFirestore();

interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'organizer' | 'customer';
  firstName?: string;
  lastName?: string;
  displayName?: string;
  createdAt: any;
  updatedAt: any;
}

interface AuthContextProps {
  firebaseUser: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, additionalData?: Partial<UserProfile>) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  signInAndRedirect: (email: string, password: string, router: AppRouterInstance) => Promise<void>;
  signInWithGoogle: () => Promise<User | undefined>;
  refreshUserToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Determine user role based on email or other criteria
  const determineUserRole = (email: string): 'admin' | 'organizer' | 'customer' => {
    // Admin emails (you can modify this list)
    const adminEmails = ['admin@nexticket.com', 'admin@company.com'];
    
    // Organizer domain patterns (you can modify these)
    const organizerDomains = ['organizer@nexticket.com'];
    const organizerPatterns = ['@events.', '@venue.', '@entertainment.'];
    
    if (adminEmails.includes(email.toLowerCase())) {
      return 'admin';
    }
    
    if (organizerDomains.includes(email.toLowerCase()) || 
        organizerPatterns.some(pattern => email.toLowerCase().includes(pattern))) {
      return 'organizer';
    }
    
    // Default to customer
    return 'customer';
  };

  // Create or update user profile in Firestore
  const createUserProfile = async (user: User, additionalData?: Partial<UserProfile>) => {
    const userDocRef = doc(db, 'users', user.uid);
    
    try {
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create new user profile
        const role = determineUserRole(user.email || '');
        
        // Create displayName from firstName/lastName if provided, otherwise use Firebase displayName
        let displayName = user.displayName || '';
        if (additionalData?.firstName || additionalData?.lastName) {
          displayName = `${additionalData.firstName || ''} ${additionalData.lastName || ''}`.trim();
        }
        
        const profileData: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          role,
          firstName: additionalData?.firstName || '',
          lastName: additionalData?.lastName || '',
          displayName: displayName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          ...additionalData
        };
        
        await setDoc(userDocRef, profileData);
        setUserProfile(profileData);
      } else {
        // Update existing profile
        const existingData = userDoc.data() as UserProfile;
        const updatedData = {
          ...existingData,
          ...additionalData,
          updatedAt: serverTimestamp()
        };
        
        await updateDoc(userDocRef, updatedData);
        setUserProfile(updatedData);
      }
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
      // Fallback: create a minimal profile
      const fallbackProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setUserProfile(fallbackProfile);
    }
  };

  // Load user profile from Firestore
  const loadUserProfile = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const profileData = userDoc.data() as UserProfile;
        setUserProfile(profileData);
      } else {
        // Create profile if it doesn't exist
        await createUserProfile(user);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Create a fallback profile
      await createUserProfile(user);
    }
  };

  // Refresh user token to get updated custom claims
  const refreshUserToken = async () => {
    try {
      if (firebaseUser) {
        console.log('🔄 Refreshing user token to get updated custom claims...');
        
        // Force refresh the ID token to get updated custom claims
        await firebaseUser.getIdToken(true);
        
        // Reload user to get fresh Firebase user data
        await firebaseUser.reload();
        
        console.log('✅ User token refreshed successfully');
        
        // Optionally refresh user profile from Firestore as well
        const docRef = doc(db, 'users', firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const profile = docSnap.data() as UserProfile;
          setUserProfile(profile);
          console.log('✅ User profile refreshed:', profile);
        }
      }
    } catch (error) {
      console.error('❌ Error refreshing user token:', error);
      throw error;
    }
  };

  // Auth state listener
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    setIsLoading(true);

    if (user) {
      await user.reload(); // Make sure emailVerified is fresh

      
      // if (!user.emailVerified) {
      //   console.warn("Email not verified");
      //   setFirebaseUser(null);
      //   setUserProfile(null);
      //   setIsLoading(false);
      //   return;
      // }

      setFirebaseUser(user);

      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile;
        setUserProfile(profile);

        // Only redirect if user is on a "neutral" page, not if they're already in their role area
        const currentPath = window.location.pathname;
        const shouldRedirect = 
          currentPath === '/' || 
          currentPath === '/auth/signin' || 
          currentPath === '/auth/signup' ||
          (!currentPath.startsWith('/admin') && profile.role === 'admin') ||
          (!currentPath.startsWith('/organizer') && profile.role === 'organizer') ||
          (!currentPath.startsWith('/venue-owner') && profile.role === 'venue_owner');

        if (shouldRedirect) {
          console.log(`Redirect needed: ${currentPath} for role: ${profile.role}`);
          // ✅ Redirect based on role only when appropriate
          switch (profile.role) {
            case 'admin':
              console.log('Redirecting centrally to admin dashboard');
              router.push('/admin/dashboard');
              break;
            case 'organizer':
              console.log('Redirecting centrally to organizer dashboard');
              router.push('/organizer/dashboard');
              break;
            case 'venue_owner':
              console.log('Redirecting centrally to venue owner dashboard');
              router.push('/venue-owner/dashboard');
              break;
            case 'customer':
              console.log('Redirecting centrally to customers dashboard');
              router.push('/dashboard');
              break;
            default:
              router.push('/dashboard');
          }
        } else {
          console.log(`User already in correct area: ${currentPath} for role: ${profile.role}`);
        }
      } else {
        //console.error("⚠️ User profile not found in Firestore.");
        //setUserProfile(null);
      }
    } else {
      setFirebaseUser(null);
      setUserProfile(null);
    }

    setIsLoading(false);
  });

  return () => unsubscribe();
}, []);

  // Listen for real-time profile changes (role updates from admin)
  useEffect(() => {
    if (!firebaseUser) return;

    console.log('Setting up real-time profile listener for user:', firebaseUser.uid);
    
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    let isInitialLoad = true;
    
    const unsubscribeProfile = onSnapshot(userDocRef, async (doc) => {
      if (doc.exists()) {
        const newProfile = doc.data() as UserProfile;
        const oldRole = userProfile?.role;
        const newRole = newProfile.role;
        
        // Skip processing during initial load to prevent loops
        if (isInitialLoad) {
          isInitialLoad = false;
          console.log('Initial profile load:', newProfile);
          return;
        }
        
        console.log('Profile update detected:', { oldRole, newRole });
        
        // Only process if role actually changed and both roles exist
        if (oldRole && newRole && oldRole !== newRole) {
          console.log(`🔄 Role changed from ${oldRole} to ${newRole}, refreshing token...`);
          try {
            await refreshUserToken();
            console.log('✅ Token refreshed successfully after role change');
            
            // Force a page reload to ensure all components see the new role
            setTimeout(() => {
              console.log('🔄 Reloading page to apply role changes...');
              window.location.reload();
            }, 1000);
            
          } catch (error) {
            console.error('❌ Failed to refresh token after role change:', error);
          }
        }
        
        // Update profile state
        setUserProfile(newProfile);
      }
    }, (error) => {
      console.error('Profile listener error:', error);
    });

    return () => {
      console.log('Cleaning up profile listener for user:', firebaseUser.uid);
      unsubscribeProfile();
    };
  }, [firebaseUser?.uid]); // Only depend on firebaseUser uid


  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // The onAuthStateChanged listener will handle profile loading
      // But we can also ensure it loads immediately
      if (userCredential.user) {
        await loadUserProfile(userCredential.user);
      }
    } catch (error) {
      throw error;
    }
    auth.currentUser?.getIdToken().then((token) => {
  console.log("ID token:", token);
});
  };

  //google sign in function
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        // Extract name components from Google profile
        const additionalData: Partial<UserProfile> = {};
        
        if (user.displayName) {
          const nameParts = user.displayName.split(' ');
          additionalData.firstName = nameParts[0] || '';
          additionalData.lastName = nameParts.slice(1).join(' ') || '';
          additionalData.displayName = user.displayName;
        }

        await createUserProfile(user, additionalData); // creates profile in Firestore if needed
        setFirebaseUser(user);
        await loadUserProfile(user); // loads user profile from Firestore
      }

      return user;
    } catch (error) {
      console.error('❌ Google Sign-in error:', error);
      throw error;
    }
  };



  // Sign up function
  const signUp = async (
  email: string,
  password: string,
  additionalData?: Partial<UserProfile>
) => {
  try {
    // Step 1: Create account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user) throw new Error('User creation failed.');

    // Step 2: Save additional profile info to Firestore
    await createUserProfile(user, additionalData);

    // Step 3: Send email verification
    await sendEmailVerification(user);
    console.log('✅ Verification email sent to', user.email);

    return user;
  } catch (error: any) {
    console.error('❌ Sign up failed:', error.message);
    throw error;
  }
};

  // onAuthStateChanged(auth, async (firebaseUser) => {
  //   if (firebaseUser) {
  //     await firebaseUser.reload(); // refresh user info

  //     if (firebaseUser.emailVerified) {
  //       // ✅ Proceed normally
  //       setFirebaseUser(firebaseUser);

  //       const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  //       if (userDoc.exists()) {
  //         setUserProfile(userDoc.data() as UserProfile);
  //       } else {
  //         setUserProfile(null);
  //       }
  //     } else {
  //       // ❌ Not verified
  //       console.warn('Email not verified');
  //       setFirebaseUser(null);
  //       setUserProfile(null);
  //     }
  //   } else {
  //   setIsLoading(false);
  //     setUserProfile(null);
  //   }

  //   setIsLoading(false);
  // });


  // Update profile function
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!firebaseUser || !userProfile) {
      throw new Error('No authenticated user');
    }

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const updatedData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(userDocRef, updatedData);
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...updatedData } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };


  const signInAndRedirect = async (email: string, password: string, router: AppRouterInstance) => {
  await firebaseSignIn(email, password);
  const user = auth.currentUser;
  if (user) {
    await loadUserProfile(user);
  }
  // if (!user) return;

  // const docRef = doc(db, 'users', user.uid);
  // const docSnap = await getDoc(docRef);
  // if (docSnap.exists()) {
  //   const profile = docSnap.data() as UserProfile;
  //   setUserProfile(profile);
  //   setFirebaseUser(user);
  //   console.log('User profile:', userProfile);

  //   // Do redirection here
  //   switch (profile.role) {
      
  //     case 'admin':
        
  //       console.log('Redirecting to admin dashboard');
  //       router.push('/admin/dashboard');
  //       break;
  //     case 'organizer':
  //       console.log('Redirecting to organizer dashboard');
  //       router.push('/organizer/dashboard');
  //       break;
  //     case 'customer':
  //       console.log('Redirecting to customers dashboard');
  //       router.push('/dashboard');
  //       break;
  //     // default:
  //     //   router.push('/dashboard');
  //   }
  // } else {
  //   console.error('No user profile found in Firestore!');
  // }
};


  // Logout function
  const logout = async () => {
    try {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      setFirebaseUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    firebaseUser,
    userProfile,
    isLoading,
    signIn,
    signUp,
    logout,
    updateProfile,
    signInAndRedirect,
    signInWithGoogle,
    refreshUserToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
