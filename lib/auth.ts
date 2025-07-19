import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

onAuthStateChanged(auth, (user) => {
  if (user) {
    // user is signed in
  } else {
    // user is signed out
  }
});

//Sign up with Email + Password
export const firebaseSignUp = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

//Sign in with Email + Password
export const firebaseSignIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

//Sign out
export const firebaseLogout = () => {
  return signOut(auth);
};
