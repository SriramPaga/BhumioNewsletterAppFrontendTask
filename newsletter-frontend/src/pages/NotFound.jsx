import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
      }}
    >
      <Box sx={{ maxWidth: 480, textAlign: 'center' }}>
        <Typography
          variant="h2"
          sx={{ fontWeight: 600, mb: 1 }}
        >
          404
        </Typography>

        <Typography variant="h6" sx={{ mb: 1 }}>
          Page not found
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          The page you’re looking for doesn’t exist or has been moved.
        </Typography>

        <Button
          component={Link}
          to="/"
          variant="contained"
        >
          Go to dashboard
        </Button>
      </Box>
    </Box>
  );
}