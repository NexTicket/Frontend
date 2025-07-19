export const getDefaultRouteForRole = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'organizer':
      return '/organizer/dashboard';
    case 'customer':
      return '/';
    default:
      return '/';
  }
};

export const getWelcomeMessage = (firstName: string, role: string): string => {
  switch (role) {
    case 'admin':
      return `Welcome back, ${firstName}! You have full administrative access.`;
    case 'organizer':
      return `Welcome back, ${firstName}! Ready to manage your events?`;
    case 'customer':
      return `Welcome back, ${firstName}! Discover amazing events near you.`;
    default:
      return `Welcome back!`;
  }
};
