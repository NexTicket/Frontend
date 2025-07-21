'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { LinkProps } from 'next/link';
import MuiLink from '@mui/material/Link';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  Chip,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  ArrowBack,
  Google,
  Facebook,
  Login,
  AdminPanelSettings,
  Person,
  Business
} from '@mui/icons-material';
import { useAuth } from '@/components/auth/auth-provider';
import { useEffect } from 'react';
//import { useEffect } from 'react';



export default function SignInPage() {
  const { signIn, userProfile, firebaseUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { signInAndRedirect, signInWithGoogle } = useAuth();
   
  useEffect(() => {
  if (authLoading) return; // wait until auth status is resolved

  if (firebaseUser && userProfile && !isRedirecting) {
    setIsRedirecting(true); // prevent multiple redirects
  }
}, [authLoading, firebaseUser, userProfile, isRedirecting, router]);


  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Attempting signin for:', email);
      await signIn(email, password);
      console.log('SignIn successful, waiting for redirect...');
      console.log('User profile:', userProfile);
      await signInAndRedirect(email, password, router);
      // Redirect will be handled by useEffect above
    } catch (err: any) {
      console.error('Sign in error:', err);
      
      // Handle specific Firebase auth errors
      let errorMessage = 'Sign in failed. Please try again.';
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password.';
          break;
        default:
          errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const quickSignIn = async (demoEmail: string, demoPassword: string) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Attempting demo signin for:', demoEmail);
      await signIn(demoEmail, demoPassword);
      console.log('Demo SignIn successful, waiting for redirect...');
      // Redirect will be handled by useEffect above
    } catch (err: any) {
      console.error('Demo sign in error:', err);
      setError('Demo sign in failed. Please try again.');
      setLoading(false);
    }
  };

  // Show loading state while auth is initializing or redirecting
  if (authLoading || isRedirecting) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2
        }}
      >
        <Paper 
          elevation={12}
          sx={{ 
            maxWidth: 450,
            width: '100%',
            padding: 4,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" gutterBottom>
            {isRedirecting ? 'Redirecting...' : loading ? 'Signing you in...' : 'Loading...'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {isRedirecting 
              ? `Welcome back! Taking you to your dashboard...`
              : firebaseUser 
              ? 'Setting up your profile...' 
              : 'Checking authentication...'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2
      }}
    >
      <Paper 
        elevation={12}
        sx={{ 
          maxWidth: 450,
          width: '100%',
          padding: 4,
          borderRadius: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          
            <Button 
              component={Link}
              href="/"
              startIcon={<ArrowBack />}
              sx={{ mb: 2, color: 'text.secondary' }}
            >
              Back to Home
            </Button>
          
          
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to your NexTicket account
          </Typography>
        </Box>

        {/* Demo Credentials */}
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          icon={<Login />}
        >
          <Typography variant="body2">
            <strong>Demo Access:</strong> Use the quick login buttons below or these credentials:
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            <Chip size="small" label="admin@nexticket.com / admin123" />
          </Box>
        </Alert>

        {/* Form */}
        <Box component="form" onSubmit={handleSignIn}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Email Field */}
          <TextField
            label="Email Address"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />

          {/* Password Field */}
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Remember Me & Forgot Password */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                />
              }
              label="Remember me"
            />
            <Button 
              variant="text" 
              color="primary"
              size="small"
            >
              Forgot password?
            </Button>
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.5,
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
              }
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          {/* Quick Demo Access */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Quick Demo Access
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<AdminPanelSettings />}
              onClick={() => quickSignIn('admin@nexticket.com', 'admin123')}
              disabled={loading}
              sx={{ 
                py: 1.2,
                borderColor: '#ff5722',
                color: '#ff5722',
                '&:hover': {
                  borderColor: '#e64a19',
                  backgroundColor: 'rgba(255, 87, 34, 0.04)'
                }
              }}
            >
              Sign in as Admin
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Person />}
              onClick={() => quickSignIn('customer@nexticket.com', 'customer123')}
              disabled={loading}
              sx={{ 
                py: 1.2,
                borderColor: '#4caf50',
                color: '#4caf50',
                '&:hover': {
                  borderColor: '#388e3c',
                  backgroundColor: 'rgba(76, 175, 80, 0.04)'
                }
              }}
            >
              Sign in as Customer
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Business />}
              onClick={() => quickSignIn('organizer@nexticket.com', 'organizer123')}
              disabled={loading}
              sx={{ 
                py: 1.2,
                borderColor: '#2196f3',
                color: '#2196f3',
                '&:hover': {
                  borderColor: '#1976d2',
                  backgroundColor: 'rgba(33, 150, 243, 0.04)'
                }
              }}
            >
              Sign in as Organizer
            </Button>
          </Box>

          {/* Social Login */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Or continue with
            </Typography>
          </Divider>

          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Google />}
              onClick={signInWithGoogle}
              sx={{ 
                py: 1.5,
                borderColor: '#db4437',
                color: '#db4437',
                '&:hover': {
                  borderColor: '#c23321',
                  backgroundColor: 'rgba(219, 68, 55, 0.04)'
                }
              }}
            >
              Google
            </Button>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Facebook />}
              sx={{ 
                py: 1.5,
                borderColor: '#3b5998',
                color: '#3b5998',
                '&:hover': {
                  borderColor: '#2d4373',
                  backgroundColor: 'rgba(59, 89, 152, 0.04)'
                }
              }}
            >
              Facebook
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don&apos;t have an account?{' '}
              <MuiLink href="/auth/signup" underline="hover" fontWeight="bold">
                Create one now
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
