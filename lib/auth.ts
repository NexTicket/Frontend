import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

import { 
  getDoc, 
  doc, 
  getFirestore, 
} from 'firebase/firestore';
import { useState } from 'react';

const db = getFirestore();

// onAuthStateChanged(auth, async (user) => {
//   const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
//   if (firebaseUser) {
//     await firebaseUser.reload(); // refresh user info

//     if (firebaseUser.emailVerified) {
//       // ✅ Proceed normally
//       setFirebaseUser(firebaseUser);

//       const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
//       setUserProfile(userDoc.data());
//     } else {
//       // ❌ Not verified
//       console.warn('Email not verified');
//       setFirebaseUser(null);
//       setUserProfile(null);
//     }
//   } else {
//     setFirebaseUser(null);
//     setUserProfile(null);
//   }

//   setLoading(false);
// });


// //Sign up with Email + Password
// export const firebaseSignUp = async (email: string, password: string) => {
//   const result = await createUserWithEmailAndPassword(auth, email, password);

//   const userRef = doc(db, 'users', result.user.uid);
//   await setDoc(userRef, {
//     email,
//     role: 'customer', //enforce 'customer' only
//     createdAt: serverTimestamp(),
//   });

//   return result;
// };

//Sign in with Email + Password
export const firebaseSignIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

//Sign out
export const firebaseLogout = () => {
  return signOut(auth);
};
