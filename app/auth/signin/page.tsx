'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Shield,
  
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';



export default function SignInPage() {
  const { signIn, userProfile, firebaseUser, isLoading: authLoading, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Container and item animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.6, -0.05, 0.01, 0.99] as any
      }
    }
  };

  // Handle redirect after successful authentication
  useEffect(() => {
    if (authLoading) return;

    if (firebaseUser && userProfile && !isRedirecting) {
      setIsRedirecting(true);
      console.log('User authenticated, redirecting...', { userProfile });
      
      // Redirect based on user role
      switch (userProfile.role) {
        case 'admin':
          console.log('Redirecting to admin dashboard');
          router.push('/admin/dashboard');
          break;
        case 'organizer':
          router.push('/organizer/dashboard');
          break;
        case 'customer':
          router.push('/events');
          break;
        default:
          router.push('/events');
          break;
      }
    }
  }, [authLoading, firebaseUser, userProfile, isRedirecting, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Attempting signin for:', formData.email);
      await signIn(formData.email, formData.password);
      console.log('SignIn successful, waiting for redirect...');
      // Redirect will be handled by useEffect above
    } catch (err: any) {
      console.error('Sign in error:', err);
      
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

  const quickSignIn = async (demoEmail: string, demoPassword: string, role: string) => {
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="backdrop-blur-xl border rounded-3xl p-8 shadow-xl text-center max-w-md w-full mx-4 bg-card border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">
            {isRedirecting ? 'Redirecting...' : loading ? 'Signing you in...' : 'Loading...'}
          </h2>
          <p className="text-muted-foreground mb-4">
            {isRedirecting 
              ? 'Welcome back! Taking you to your dashboard...'
              : firebaseUser 
              ? 'Setting up your profile...' 
              : 'Checking authentication...'}
          </p>
          <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full mx-auto animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-background">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/Images/signup.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3,
        }}
      />

      {/* Background Elements */}
      <div className="absolute inset-0 z-1">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20 bg-muted"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15 bg-primary"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10 bg-primary"></div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Side - Welcome Section */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="hidden lg:flex items-center justify-center p-8"
        >
          <motion.div variants={itemVariants} className="w-full max-w-md">
            <motion.div 
              className="relative group cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="absolute -inset-4 rounded-3xl blur-2xl opacity-30 transition-opacity duration-300 group-hover:opacity-50 bg-primary"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.02, 0.98, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              ></motion.div>
              <motion.div 
                className="relative backdrop-blur-xl border rounded-3xl p-8 text-center shadow-2xl transition-all duration-300 group-hover:shadow-3xl bg-card/80 border-primary/30"
                whileHover={{ borderColor: 'hsl(var(--primary) / 0.6)' }}
              >
                <motion.div 
                  className="w-32 h-32 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 bg-primary/20"
                  whileHover={{ 
                    scale: 1.1,
                    backgroundColor: 'hsl(var(--primary) / 0.3)' 
                  }}
                  animate={{ 
                    y: [0, -5, 0],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <Shield 
                      className="w-16 h-16 transition-colors duration-300 text-primary" 
                    />
                  </motion.div>
                </motion.div>
                <motion.h2 
                  className="text-3xl font-bold text-foreground mb-4 transition-all duration-300 group-hover:text-primary"
                  animate={{ 
                    textShadow: [
                      '0 0 0px rgba(216, 223, 238, 0)',
                      '0 0 10px rgba(216, 223, 238, 0.3)',
                      '0 0 0px rgba(216, 223, 238, 0)'
                    ]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  Welcome Back
                </motion.h2>
                <motion.p 
                  className="text-muted-foreground text-lg leading-relaxed transition-opacity duration-300 group-hover:opacity-100"
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  Sign in to access your NexTicket dashboard and continue managing your events seamlessly.
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Right Side - Form */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex items-center justify-center p-8"
        >
          <motion.div variants={itemVariants} className="w-full max-w-md">
            <div className="backdrop-blur-xl border rounded-3xl p-8 shadow-2xl bg-card/80 border-border">
              {/* Header */}
              <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center text-foreground hover:opacity-80 transition-opacity mb-6">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
                
                <h1 className="text-3xl font-bold text-foreground mb-2">Sign In</h1>
                <p className="text-muted-foreground">Welcome back to NexTicket</p>
              </div>

              {/* Demo Access Info */}
              {/* <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#0D6EFD' + '20', border: '1px solid ' + '#0D6EFD' + '30' }}>
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-4 h-4" style={{ color: '#0D6EFD' }} />
                  <p className="text-white font-medium">Demo Access Available</p>
                </div>
                <p className="text-white opacity-70 text-sm">Use the quick login buttons below or: admin@nexticket.com / admin123</p>
              </div> */}

              {/* Form */}
              <form onSubmit={handleSignIn} className="space-y-6">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 p-3 rounded-lg" style={{ backgroundColor: '#ef4444' + '20', border: '1px solid #ef4444' + '30' }}
                  >
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-red-300 text-sm">{error}</p>
                  </motion.div>
                )}

                {/* Email Field */}
                <motion.div variants={itemVariants} className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                    style={{ 
                      borderColor: '#ABA8A9' + '30'
                    }}
                  />
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants} className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-12 py-3 rounded-lg border bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                    style={{ 
                      borderColor: '#ABA8A9' + '30'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </motion.div>

                {/* Remember Me & Forgot Password */}
                <motion.div variants={itemVariants} className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-white opacity-80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">Remember me</span>
                  </label>
                  <button type="button" className="text-sm hover:underline" style={{ color: '#0D6EFD' }}>
                    Forgot password?
                  </button>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: '#0D6EFD' }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </motion.div>

                {/* Quick Demo Access */}
                {/* <motion.div variants={itemVariants}>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" style={{ borderColor: '#ABA8A9' + '30' }}></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 text-gray-400" style={{ backgroundColor: '#191C24' }}>Quick Demo Access</span>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => quickSignIn('admin@nexticket.com', 'admin123', 'admin')}
                    disabled={loading}
                    className="flex items-center justify-center space-x-2 py-2 px-4 border rounded-lg text-white hover:bg-gray-700 transition-colors text-sm"
                    style={{ borderColor: '#ff5722' + '60', color: '#ff5722' }}
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Demo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSignIn('customer@nexticket.com', 'customer123', 'customer')}
                    disabled={loading}
                    className="flex items-center justify-center space-x-2 py-2 px-4 border rounded-lg text-white hover:bg-gray-700 transition-colors text-sm"
                    style={{ borderColor: '#4caf50' + '60', color: '#4caf50' }}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Customer Demo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSignIn('organizer@nexticket.com', 'organizer123', 'organizer')}
                    disabled={loading}
                    className="flex items-center justify-center space-x-2 py-2 px-4 border rounded-lg text-white hover:bg-gray-700 transition-colors text-sm"
                    style={{ borderColor: '#2196f3' + '60', color: '#2196f3' }}
                  >
                    <User className="w-4 h-4" />
                    <span>Organizer Demo</span>
                  </button>
                </motion.div> */}

                {/* Divider */}
                <motion.div variants={itemVariants} className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: '#ABA8A9' + '30' }}></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 text-gray-400" style={{ backgroundColor: '#191C24' }}>Or continue with</span>
                  </div>
                </motion.div>

                {/* Social Login */}
                <motion.div variants={itemVariants}>
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="w-full py-3 px-4 border rounded-lg text-white hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                    style={{ borderColor: '#ABA8A9' + '30' }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                </motion.div>

                {/* Sign Up Link */}
                <motion.div variants={itemVariants} className="text-center">
                  <p className="text-gray-400">
                    Don't have an account?{' '}
                    <Link href="/auth/signup" className="font-semibold hover:underline" style={{ color: '#0D6EFD' }}>
                      Create one now
                    </Link>
                  </p>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
