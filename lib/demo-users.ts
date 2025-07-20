// This file contains demo user setup instructions
// To create demo users in Firebase, run these commands in the Firebase Console

/*
Demo Users to Create in Firebase Authentication:

1. Admin User:
   Email: admin@nexticket.com
   Password: admin123
   
2. Organizer User:
   Email: organizer@nexticket.com
   Password: organizer123
   
3. Customer User:
   Email: customer@nexticket.com
   Password: customer123

After creating these users in Firebase Authentication, 
the auth provider will automatically create their profiles 
in Firestore with the appropriate roles based on email patterns.

The role assignment logic is in components/auth/auth-provider.tsx:
- admin@nexticket.com -> admin role
- organizer@nexticket.com -> organizer role  
- customer@nexticket.com -> customer role
*/

// Alternative: You can also create users programmatically by running this in the browser console
// when connected to your Firebase project:

export const createDemoUsers = `
// Run this in browser console with Firebase SDK loaded
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();
const demoUsers = [
  { email: 'admin@nexticket.com', password: 'admin123' },
  { email: 'organizer@nexticket.com', password: 'organizer123' }, 
  { email: 'customer@nexticket.com', password: 'customer123' }
];

demoUsers.forEach(async (user) => {
  try {
    await createUserWithEmailAndPassword(auth, user.email, user.password);
    console.log('Created user:', user.email);
  } catch (error) {
    console.error('Error creating user:', user.email, error);
  }
});
`;
