'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '@/components/auth/auth-provider';

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    try {
      setError('');
      await signUp(email, password);
      router.push('/admin/dashboard');
    } catch (err) {
      setError('Signup failed. Try again.');
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={10}>
      <Typography variant="h4" mb={3}>Sign Up</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button variant="contained" color="primary" fullWidth onClick={handleSignup} sx={{ mt: 2 }}>
        Sign Up
      </Button>
    </Box>
  );
}
