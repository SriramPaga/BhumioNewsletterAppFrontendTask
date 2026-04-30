import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
} from "@mui/material";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user: authUser } = useAuth(); // ✅ use context
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("Auth User:", authUser);

  const userId = authUser?.id || authUser?.sub; // ✅ FIX

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.getUserProfile(userId);
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // 🔄 Loading state
  if (loading) {
    return (
      <Box p={3}>
        <CircularProgress />
      </Box>
    );
  }

  // ❌ No data
  if (!profile) {
    return (
      <Box p={3}>
        <Typography>No user data available</Typography>
      </Box>
    );
  }

  // ✅ UI
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Profile</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          View your account details and organization information
        </Typography>
      </Box>

      {/* Content */}
      <Card
        sx={{
          backgroundColor: "rgba(37, 99, 235, 0.05)",
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Grid container spacing={2}>
            {/* Name */}
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {profile.fullName}
              </Typography>
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {profile.email}
              </Typography>
            </Grid>

            {/* Role */}
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">
                Role
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {profile.role}
              </Typography>
            </Grid>

            {/* Organization */}
            <Grid item xs={12} md={6}>
              <Typography variant="caption" color="text.secondary">
                Organization
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {profile?.organization?.name ||
                  (profile?.organization?.id
                    ? `Org #${profile.organization.id}`
                    : "N/A")}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
