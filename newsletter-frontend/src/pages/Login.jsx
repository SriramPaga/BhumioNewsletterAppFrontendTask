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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: 400,
          borderRadius: 3,
          boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          
          {/* Branding */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: '#111827' }}
            >
              Newsletter Console
            </Typography>

            <Typography variant="body2" sx={{ color: '#6b7280', mt: 0.5 }}>
              Sign in to manage campaigns and subscribers
            </Typography>
          </Box>

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
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

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                py: 1.2,
                borderRadius: 2,
              }}
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </Box>

          {/* Optional helper (nice touch for demo) */}
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              mt: 3,
              color: '#9ca3af',
            }}
          >
            Use your registered credentials to continue
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}