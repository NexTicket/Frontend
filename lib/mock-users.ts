// Hardcoded users for development
export interface MockUser {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'customer' | 'organizer';
  displayName: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'admin@nexticket.com',
    password: 'admin123',
    role: 'admin',
    displayName: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    profilePicture: '/Images/profile-avatar-account-icon.png'
  },
  {
    id: '2',
    email: 'customer@nexticket.com',
    password: 'customer123',
    role: 'customer',
    displayName: 'John Customer',
    firstName: 'John',
    lastName: 'Customer',
    profilePicture: '/Images/profile-avatar-account-icon.png'
  },
  {
    id: '3',
    email: 'organizer@nexticket.com',
    password: 'organizer123',
    role: 'organizer',
    displayName: 'Jane Organizer',
    firstName: 'Jane',
    lastName: 'Organizer',
    profilePicture: '/Images/profile-avatar-account-icon.png'
  }
];

// Helper function to find user by email and password
export const findUserByCredentials = (email: string, password: string): MockUser | null => {
  return mockUsers.find(user => user.email === email && user.password === password) || null;
};

// Helper function to get user by ID
export const getUserById = (id: string): MockUser | null => {
  return mockUsers.find(user => user.id === id) || null;
};
