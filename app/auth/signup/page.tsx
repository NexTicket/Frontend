'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Alert, 
  Paper,
  InputAdornment,
  IconButton,
  LinearProgress,
  Chip,
  Divider
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  Person,
  ArrowBack,
  Google,
  Facebook,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { useAuth } from '@/components/auth/auth-provider';
import MuiLink from '@mui/material/Link';
import NextLink from 'next/link';
import { getAuth } from 'firebase/auth';

export default function SignupPage() {
  const auth = getAuth();
  const { signUp, userProfile, firebaseUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { signInWithGoogle } = useAuth();

  // Handle redirect after successful authentication
  useEffect(() => {
    if (!authLoading && firebaseUser && userProfile) {
      console.log('User authenticated after signup, redirecting...', { userProfile });
      
      // Redirect based on user role
      switch (userProfile.role) {
        case 'admin':
          console.log('Redirecting to admin dashboard from signup');
          router.push('/admin/dashboard');
          break;
        case 'organizer':
          router.push('/organizer/dashboard');
          break;
        case 'customer':
          router.push('/dashboard');
          break;
        default:
          router.push('/auth/signin');
          break;
      }
    }
  }, [authLoading, firebaseUser, userProfile, router]);

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 25;
    return Math.min(strength, 100);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return 'error';
    if (passwordStrength < 75) return 'warning';
    return 'success';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Very Weak';
    if (passwordStrength < 50) return 'Weak';
    if (passwordStrength < 75) return 'Good';
    if (passwordStrength < 100) return 'Strong';
    return 'Very Strong';
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Create the additional user data to save to Firestore
      const additionalUserData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        displayName: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
      };

      // Pass the additional data to signUp function
      await signUp(formData.email, formData.password, additionalUserData);
      
      console.log('✅ User created with profile data:', additionalUserData);
      // Redirect will be handled by useEffect above after profile is created
    } catch (err: any) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth is initializing
  if (authLoading) {
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
            Loading...
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
          maxWidth: 480,
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
            Create Account
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Join NexTicket and start exploring amazing events
          </Typography>
        </Box>

        {/* Alert for existing users */}
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          icon={<CheckCircle />}
        >
          <Typography variant="body2">
            <strong>Demo Mode:</strong> You can create a new account or use existing demo credentials on the{' '}
            <MuiLink component={NextLink} href="/auth/signin" underline="none" fontWeight="bold">
              Sign In page
            </MuiLink>
          </Typography>
        </Alert>

        {/* Form */}
        <Box component="form" onSubmit={handleSignup}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Name Fields */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              name="firstName"
              label="First Name"
              variant="outlined"
              fullWidth
              value={formData.firstName}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              name="lastName"
              label="Last Name"
              variant="outlined"
              fullWidth
              value={formData.lastName}
              onChange={handleInputChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Email Field */}
          <TextField
            name="email"
            label="Email Address"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleInputChange}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Please verify your email to continue. Check your inbox.
            </Typography>
            {/* <Button 
              onClick={() => firebaseUser && sendEmailVerification(firebaseUser)}
              disabled={!firebaseUser}
              size="small"
              sx={{ mt: 1 }}
              variant="outlined"
            >
              Resend Verification Email
            </Button> */}
          </Box>
          

          {/* Password Field */}
          <TextField
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleInputChange}
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

          {/* Password Strength Indicator */}
          {formData.password && (
            <Box sx={{ mt: 1, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Password Strength
                </Typography>
                <Chip 
                  label={getPasswordStrengthText()} 
                  size="small" 
                  color={getPasswordStrengthColor()}
                  variant="outlined"
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={passwordStrength} 
                color={getPasswordStrengthColor()}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          )}

          {/* Confirm Password Field */}
          <TextField
            name="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            error={formData.confirmPassword !== '' && formData.password !== formData.confirmPassword}
            helperText={
              formData.confirmPassword !== '' && formData.password !== formData.confirmPassword 
                ? 'Passwords do not match' 
                : ''
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

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
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          {/* Divider */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Or continue with
            </Typography>
          </Divider>

          {/* Social Login Buttons */}
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

          {/* Sign In Link */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <MuiLink 
                component={NextLink} 
                href="/auth/signin" 
                underline="none" 
                fontWeight="bold" 
                color="primary"
              >
                Sign in here
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
