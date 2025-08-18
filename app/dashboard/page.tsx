'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  CardActions,
  Avatar,
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  AdminPanelSettings,
  Business,
  Person,
  EventNote,
  ConfirmationNumber,
  TrendingUp,
  Notifications,
  Settings,
  ExitToApp
} from '@mui/icons-material';
import { useAuth } from '@/components/auth/auth-provider';
import { sendEmailVerification } from 'firebase/auth';
import { secureFetch } from '@/utils/secureFetch';

export default function DashboardPage() {
  const { userProfile, firebaseUser, isLoading, logout } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users to signin
  useEffect(() => {
    if (!isLoading && !firebaseUser) {
      router.push('/auth/signin');
    }
  }, [isLoading, firebaseUser, router]);

  useEffect(() => {
  const loadProfile = async () => {
    try {
      const res = await secureFetch('http://localhost:4001/profile');
      const data = await res.json();
      console.log('🔥 Backend profile:', data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  loadProfile();
}, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading your dashboard...
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Show signin prompt if not authenticated
  if (!firebaseUser || !userProfile) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <Typography variant="h5" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Please sign in to access your dashboard.
          </Typography>
          <Button variant="contained" component={Link} href="/auth/signin">
            Sign In
          </Button>
        </Paper>
      </Box>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettings />;
      case 'organizer':
        return <Business />;
      default:
        return <Person />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'organizer':
        return 'primary';
      default:
        return 'success';
    }
  };

  const getQuickActions = () => {
    switch (userProfile.role) {
      case 'admin':
        return [
          {
            title: 'Admin Dashboard',
            description: 'Manage users, events, and system settings',
            icon: <AdminPanelSettings />,
            href: '/admin/dashboard',
            color: '#f44336'
          },
          {
            title: 'User Management',
            description: 'View and manage user accounts',
            icon: <Person />,
            href: '/admin/users',
            color: '#2196f3'
          },
          {
            title: 'Events Overview',
            description: 'Monitor all events in the system',
            icon: <EventNote />,
            href: '/admin/events',
            color: '#4caf50'
          }
        ];
      case 'organizer':
        return [
          {
            title: 'Organizer Dashboard',
            description: 'Manage your events and view analytics',
            icon: <Business />,
            href: '/organizer/dashboard',
            color: '#2196f3'
          },
          {
            title: 'Create Event',
            description: 'Add a new event to your portfolio',
            icon: <EventNote />,
            href: '/organizer/events/new',
            color: '#4caf50'
          },
          {
            title: 'My Events',
            description: 'View and edit your existing events',
            icon: <TrendingUp />,
            href: '/organizer/events',
            color: '#ff9800'
          }
        ];
      default:
        return [
          {
            title: 'Browse Events',
            description: 'Discover amazing events near you',
            icon: <EventNote />,
            href: '/events',
            color: '#4caf50'
          },
          {
            title: 'My Tickets',
            description: 'View your purchased tickets',
            icon: <ConfirmationNumber />,
            href: '/profile',
            color: '#2196f3'
          },
          {
            title: 'Explore Venues',
            description: 'Find venues for upcoming events',
            icon: <Business />,
            href: '/venues',
            color: '#ff9800'
          }
        ];
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        {/* Header */}
        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: getRoleColor(userProfile.role) === 'error' ? '#f44336' : getRoleColor(userProfile.role) === 'primary' ? '#2196f3' : '#4caf50' }}>
                {getRoleIcon(userProfile.role)}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Welcome back, {userProfile.firstName || userProfile.displayName || 'User'}!
                </Typography>
                <Box sx={{ mb: 2 }}>
                  
                  <Button 
                    onClick={() => firebaseUser && sendEmailVerification(firebaseUser)}
                    disabled={!firebaseUser}
                    size="small"
                    sx={{ mt: 1 }}
                    variant="outlined"
                  >
                    Resend Verification Email
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Chip 
                    label={userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                    color={getRoleColor(userProfile.role) as any}
                    size="small"
                  />
                  <Typography variant="body2" color="text.secondary">
                    {userProfile.email}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Settings />}
                component={Link}
                href="/profile"
              >
                Settings
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<ExitToApp />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Welcome Message */}
        <Paper elevation={2} sx={{ p: 3, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Typography variant="h6" gutterBottom>
            🎉 Welcome to NexTicket Dashboard
          </Typography>
          <Typography variant="body1">
            {userProfile.role === 'admin' 
              ? 'You have full administrative access to manage the platform.'
              : userProfile.role === 'organizer'
              ? 'Start creating and managing your events to reach more audiences.'
              : 'Discover amazing events and book your tickets with ease.'
            }
          </Typography>
        </Paper>

        {/* Quick Actions */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
          Quick Actions
        </Typography>
        
        <Grid container spacing={3}>
          {getQuickActions().map((action, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                component={Link}
                href={action.href}
                style={{ textDecoration: 'none' }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box 
                      sx={{ 
                        p: 1, 
                        borderRadius: 2, 
                        bgcolor: action.color,
                        color: 'white',
                        mr: 2
                      }}
                    >
                      {action.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      {action.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" sx={{ color: action.color }}>
                    Get Started
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Recent Activity */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, mt: 4 }}>
          Recent Activity
        </Typography>
        
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Notifications sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No recent activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your recent actions will appear here
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
