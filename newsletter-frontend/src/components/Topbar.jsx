import { AppBar, Box, Toolbar, Typography, Button } from '@mui/material';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Topbar() {
  const { user, logout, organizationId  } = useAuth();
console.log("Topbar org:", organizationId);
  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: '1px solid #e5e7eb',
        bgcolor: '#ffffff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: 64,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        {/* Left Section (Page Context) */}
        <Box>
          <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 600 }}>
            Campaigns
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and send your campaigns
          </Typography>
        </Box>

        {/* Right Section (User + Actions) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>

          <Button
            variant="outlined"
            size="small"
            onClick={logout}
            sx={{
              borderColor: '#d1d5db',
              color: 'text.primary',
              '&:hover': {
                borderColor: '#9ca3af',
                backgroundColor: '#f9fafb',
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}