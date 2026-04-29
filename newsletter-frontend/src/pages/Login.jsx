import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import api from '../services/api.js';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.login({ email, password });
      login(response.data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ width: 380, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" mb={2}>
            Newsletter Admin Login
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              fullWidth
              label="Email"
              margin="normal"
              type="email"
              autoComplete="username"
            />
            <TextField
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
              label="Password"
              margin="normal"
              type="password"
              autoComplete="current-password"
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
