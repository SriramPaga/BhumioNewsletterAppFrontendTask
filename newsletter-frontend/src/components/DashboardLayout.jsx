import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function DashboardLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0, // prevents overflow issues
        }}
      >
        <Topbar />

        {/* Spacer for AppBar */}
        <Toolbar />

        {/* Page Container */}
        <Box
          sx={{
            flex: 1,
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2, md: 3 },
            width: '100%',
            maxWidth: '1200px', // 🔥 key for newsletter readability
            mx: 'auto', // center content
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}