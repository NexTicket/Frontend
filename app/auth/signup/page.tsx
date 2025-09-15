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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const { signUp, userProfile, firebaseUser, isLoading: authLoading, signInWithGoogle } = useAuth();
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
  const [emailError, setEmailError] = useState('');

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
          router.push('/events');
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

  // Email validation function
  const validateEmail = (email: string) => {
    // Basic email regex pattern
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!email) {
      return '';
    }
    
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    
    // Additional checks for common mistakes
    if (email.includes('..')) {
      return 'Email cannot contain consecutive dots';
    }
    
    if (email.startsWith('.') || email.endsWith('.')) {
      return 'Email cannot start or end with a dot';
    }
    
    return '';
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

    if (name === 'email') {
      // Real-time email validation
      const emailValidationError = validateEmail(value);
      setEmailError(emailValidationError);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return '#ef4444';
    if (passwordStrength < 75) return '#f59e0b';
    return '#0D6EFD';
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
    // Use the real-time email validation function
    const emailValidationError = validateEmail(formData.email);
    if (emailValidationError) {
      setError(emailValidationError);
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#191C24' }}>
        <div className="backdrop-blur-xl border rounded-3xl p-8 shadow-xl text-center max-w-md w-full mx-4" style={{ backgroundColor: '#191C24', borderColor: '#ABA8A9' + '30' }}>
          <h2 className="text-xl font-bold text-white mb-4">Loading...</h2>
          <div className="w-10 h-10 border-4 border-gray-300 border-t-4 rounded-full mx-auto animate-spin" style={{ borderTopColor: '#0D6EFD' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: '#191C24' }}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url("/Images/signup.jpg")', // Correct path for Next.js
          backgroundSize: 'cover',     // Options: cover, contain, auto
          backgroundPosition: 'center', // Options: center, top, bottom, left, right
          backgroundRepeat: 'no-repeat',
          opacity: 0.3, // Increased opacity to make it more visible
        }}
      />
      

      {/* Background Elements */}
      <div className="absolute inset-0 z-1">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-20" style={{ backgroundColor: '#ABA8A9' }}></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ backgroundColor: '#0D6EFD' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ backgroundColor: '#0D6EFD' }}></div>
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Side - Image */}
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
                className="absolute -inset-4 rounded-3xl blur-2xl opacity-30 transition-opacity duration-300 group-hover:opacity-50" 
                style={{ backgroundColor: '#0D6EFD' }}
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
                className="relative backdrop-blur-xl border rounded-3xl p-8 text-center shadow-2xl transition-all duration-300 group-hover:shadow-3xl" 
                style={{ backgroundColor: '#191C24' + '80', borderColor: '#0D6EFD' + '30' }}
                whileHover={{ borderColor: '#0D6EFD' + '60' }}
              >
                <motion.div 
                  className="w-32 h-32 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300" 
                  style={{ backgroundColor: '#0D6EFD' + '20' }}
                  whileHover={{ 
                    scale: 1.1,
                    backgroundColor: '#0D6EFD' + '30' 
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
                    <CheckCircle 
                      className="w-16 h-16 transition-colors duration-300" 
                      style={{ color: '#0D6EFD' }} 
                    />
                  </motion.div>
                </motion.div>
                <motion.h2 
                  className="text-3xl font-bold text-white mb-4 transition-all duration-300 group-hover:text-blue-100"
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
                  Welcome to NexTicket
                </motion.h2>
                <motion.p 
                  className="text-white opacity-80 text-lg leading-relaxed transition-opacity duration-300 group-hover:opacity-100"
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: [0.8, 1, 0.8] }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  Join thousands of event organizers and attendees who trust NexTicket for seamless event management and unforgettable experiences.
                </motion.p>
                {/* <motion.div 
                  className="mt-6 flex justify-center space-x-4"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  <motion.div 
                    className="w-3 h-3 rounded-full transition-all duration-300" 
                    style={{ backgroundColor: '#0D6EFD' }}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 0
                    }}
                  ></motion.div>
                  <motion.div 
                    className="w-3 h-3 rounded-full transition-all duration-300" 
                    style={{ backgroundColor: '#ABA8A9' }}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 0.5
                    }}
                  ></motion.div>
                  <motion.div 
                    className="w-3 h-3 rounded-full transition-all duration-300" 
                    style={{ backgroundColor: '#0D6EFD' }}
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: 1
                    }}
                  ></motion.div>
                </motion.div> */}
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
            <div className="backdrop-blur-xl border rounded-3xl p-8 shadow-2xl" style={{ backgroundColor: '#191C24' + '80', borderColor: '#ABA8A9' + '30' }}>
              {/* Header */}
              <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center text-white hover:opacity-80 transition-opacity mb-6">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
                
                <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                <p className="text-white opacity-70">Join NexTicket and start exploring amazing events</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSignup} className="space-y-6">
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

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div variants={itemVariants} className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="firstName"
                      type="text"
                      placeholder="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                      style={{ 
                        borderColor: '#ABA8A9' + '30'
                      }}
                    />
                  </motion.div>
                  <motion.div variants={itemVariants} className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name="lastName"
                      type="text"
                      placeholder="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                      style={{ 
                        borderColor: '#ABA8A9' + '30'
                      }}
                    />
                  </motion.div>
                </div>

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
                      borderColor: emailError ? '#ef4444' : '#ABA8A9' + '30'
                    }}
                  />
                  {/* Email validation feedback */}
                  {formData.email && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {emailError ? (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                  )}
                </motion.div>

                {/* Email Error Message */}
                {emailError && formData.email && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <p className="text-red-400 text-sm">{emailError}</p>
                  </motion.div>
                )}

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

                {/* Password Strength Indicator */}
                {formData.password && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Password Strength</span>
                      <span 
                        className="text-sm font-medium"
                        style={{ color: getPasswordStrengthColor() }}
                      >
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${passwordStrength}%`,
                          backgroundColor: getPasswordStrengthColor()
                        }}
                      ></div>
                    </div>
                  </motion.div>
                )}

                {/* Confirm Password Field */}
                <motion.div variants={itemVariants} className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-12 py-3 rounded-lg border bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 transition-all"
                    style={{ 
                      borderColor: formData.confirmPassword !== '' && formData.password !== formData.confirmPassword 
                        ? '#ef4444' 
                        : '#ABA8A9' + '30'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </motion.div>

                {formData.confirmPassword !== '' && formData.password !== formData.confirmPassword && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-sm mt-1"
                  >
                    Passwords do not match
                  </motion.p>
                )}

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-black font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: '#0D6EFD' }}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </motion.div>

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
                    <span>Sign up with Google</span>
                  </button>
                </motion.div>

                {/* Sign In Link */}
                <motion.div variants={itemVariants} className="text-center">
                  <p className="text-gray-400">
                    Already have an account?{' '}
                    <Link href="/auth/signin" className="font-semibold hover:underline" style={{ color: '#0D6EFD' }}>
                      Sign in here
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
