import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Avatar,
} from "@mui/material";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Topbar() {
  const { user, logout, organizationId } = useAuth();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        borderBottom: "1px solid #e5e7eb",
        bgcolor: "rgba(255,255,255,0.8)", // 🔥 glass effect
        backdropFilter: "blur(8px)", // 🔥 premium feel
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          minHeight: 64,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* Left Section */}
        <Box sx={{ lineHeight: 1.2 }}>
          <Typography
            variant="h6"
            sx={{
              fontSize: 18,
              fontWeight: 700,
              color: "#2b3345", // 🔥 fix visibility
            }}
          >
            Newsletter Console
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {/* Manage campaigns, subscribers, and analytics for {user?.organization?.name || 'Organization'} */}
            Organization: {user?.organization?.name || `Org #${organizationId}`}
          </Typography>
        </Box>

        {/* Right Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Avatar (new) */}
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: 14,
              bgcolor: "#4A9475",
            }}
          >
            {user?.email?.[0]?.toUpperCase()}
          </Avatar>

          {/* Email */}
          <Typography variant="body2" color="text.secondary">
            {user?.name || user?.email?.split("@")[0]}
          </Typography>

          {/* Logout */}
          <Button
            variant="outlined"
            size="small"
            onClick={logout}
            sx={{
              borderColor: "#d1d5db",
              color: "text.primary",
              borderRadius: 2,
              textTransform: "none",
              "&:hover": {
                borderColor: "#9ca3af",
                backgroundColor: "#f9fafb",
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
