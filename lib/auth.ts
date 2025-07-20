import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const db = getFirestore();

onAuthStateChanged(auth, (user) => {
  if (user) {
    // user is signed in
  } else {
    // user is signed out
  }
});

//Sign up with Email + Password
export const firebaseSignUp = async (email: string, password: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);

  const userRef = doc(db, 'users', result.user.uid);
  await setDoc(userRef, {
    email,
    role: 'customer', //enforce 'customer' only
    createdAt: serverTimestamp(),
  });

  return result;
};

//Sign in with Email + Password
export const firebaseSignIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

//Sign out
export const firebaseLogout = () => {
  return signOut(auth);
};
