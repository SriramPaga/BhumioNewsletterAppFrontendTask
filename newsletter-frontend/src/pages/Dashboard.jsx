import { useEffect, useState } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import {
  People as PeopleIcon,
  ListAlt as ListIcon,
  Campaign as CampaignIcon,
  Queue as QueueIcon,
} from "@mui/icons-material";
import api from "../services/api.js";

export default function Dashboard() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [subsRes, listsRes, campaignsRes, healthRes] = await Promise.all([
          api.getSubscribers(),
          api.getLists(),
          api.getCampaigns(),
          api.getAutomationHealth(),
        ]);

        setCounts({
          subscribers: subsRes.data.length,
          lists: listsRes.data.length,
          campaigns: campaignsRes.data.length,
          automation: healthRes.data.automation?.count || 0,
        });
      } catch (err) {
        setMessage(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const iconColors = {
    subscribers: "#4A9475", // muted green
    lists: "#4F46E5", // indigo
    campaigns: "#2563EB", // soft blue
    automation: "#D97706", // muted amber
  };

  const stats = [
    {
      label: "Subscribers",
      value: counts.subscribers,
      icon: (
        <PeopleIcon fontSize="small" sx={{ color: iconColors.subscribers }} />
      ),
    },
    {
      label: "Lists",
      value: counts.lists,
      icon: <ListIcon fontSize="small" sx={{ color: iconColors.lists }} />,
    },
    {
      label: "Campaigns",
      value: counts.campaigns,
      icon: (
        <CampaignIcon fontSize="small" sx={{ color: iconColors.campaigns }} />
      ),
    },
    {
      label: "Automation Queue",
      value: counts.automation,
      icon: (
        <QueueIcon fontSize="small" sx={{ color: iconColors.automation }} />
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700 }}
          gutterBottom
        >
          Overview
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor your audience, campaigns, and delivery pipeline.
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={3}>
        {stats.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: "rgba(0,0,0,0.04)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 1,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ ml: 1 }}
                    color="text.secondary"
                  >
                    {item.label}
                  </Typography>
                </Box>

                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {loading ? "—" : item.value || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Section */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Getting started
              </Typography>

              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Create your first list, add subscribers, and launch a campaign.
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button href="/subscribers" variant="contained">
                  Add subscribers
                </Button>

                <Button href="/campaigns" variant="outlined">
                  Create campaign
                </Button>
              </Box>

              {message && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {message}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System status
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Chip label="API Connected" color="success" size="small" />
                <Chip label="Queue Active" color="default" size="small" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
