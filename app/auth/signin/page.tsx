'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '@/components/auth/auth-provider';

export default function LoginPage() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setError('');
      await signIn(email, password);
      router.push('/admin/dashboard'); // or /organizer if you detect role
    } catch (err) {
      setError('Login failed. Check your credentials.');
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={10}>
      <Typography variant="h4" mb={3}>Login</Typography>
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
      <Button variant="contained" color="primary" fullWidth onClick={handleLogin} sx={{ mt: 2 }}>
        Sign In
      </Button>
    </Box>
  );
}
