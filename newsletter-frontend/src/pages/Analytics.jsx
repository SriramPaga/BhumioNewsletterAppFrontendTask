import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
} from "@mui/material";
import api from "../services/api.js";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AdsClickOutlinedIcon from "@mui/icons-material/AdsClickOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";

export default function Analytics() {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const campaignsRes = await api.getCampaigns();
        setCampaigns(campaignsRes.data);
        const statsPromises = campaignsRes.data.map((campaign) =>
          api
            .getCampaignStats(campaign.id)
            .then((res) => ({ ...res.data, subject: campaign.subject })),
        );
        const resolved = await Promise.all(statsPromises);
        setStats(resolved);
      } catch (error) {
        setMessage(error.message);
      }
    }
    load();
  }, []);

  return (
    <Box>
      <Alert
        severity="info"
        sx={{
          backgroundColor: "rgba(37,99,235,0.05)",
          border: "1px solid rgba(37,99,235,0.1)",
          mb: 2,
        }}
      >
        Real-time delivery data: In local setups, metrics may remain 0.
      </Alert>
      <Typography variant="h4" mb={2}>
        Performance Analytics
      </Typography>
      {message && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}
      {campaigns.length === 0 && (
        <Typography sx={{ mt: 2 }} color="text.secondary">
          No campaigns found. Create and send a campaign to see analytics.
        </Typography>
      )}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: "#e7e7e7" }}>
            <CardContent>
              <Typography variant="h6">Campaigns tracked</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, mt: 2 }}>
                {campaigns.length}
              </Typography>
              <Typography color="text.secondary">
                Total campaigns loaded from backend.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card
            sx={{
              "&:hover": {
                transform: "none",
                boxShadow: "none",
              },
            }}
          >
            <CardContent>
              <Typography variant="h6">Top metrics</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderLeft: "4px solid #4A9475", // change color per metric
                      backgroundColor: "rgba(74,148,117,0.03)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <VisibilityOutlinedIcon
                        sx={{ fontSize: 18, color: "#4A9475" }}
                      />
                      <Typography color="text.secondary">Opens</Typography>
                    </Box>
                    <Typography variant="h5">
                      {(stats || []).reduce(
                        (sum, item) => sum + Number(item.opens || 0),
                        0,
                      )}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderLeft: "4px solid #2563EB", // change color per metric
                      backgroundColor: "rgba(74,148,117,0.03)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AdsClickOutlinedIcon
                        sx={{ fontSize: 18, color: "#2563EB" }}
                      />
                      <Typography color="text.secondary">Clicks</Typography>
                    </Box>
                    <Typography variant="h5">
                      {stats.reduce(
                        (sum, item) => sum + Number(item.clicks || 0),
                        0,
                      )}
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderLeft: "4px solid #D97706", // change color per metric
                      backgroundColor: "rgba(74,148,117,0.03)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PeopleOutlineIcon
                        sx={{ fontSize: 18, color: "#D97706" }}
                      />
                      <Typography color="text.secondary">Unique</Typography>
                    </Box>
                    <Typography variant="h5">
                      {stats.reduce(
                        (sum, item) =>
                          sum + Number(item.uniqueSubscribers || 0),
                        0,
                      )}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {stats.length > 0 &&
        stats.every(
          (item) =>
            Number(item.opens || 0) === 0 && Number(item.clicks || 0) === 0,
        ) && (
          <Typography sx={{ mt: 3 }} color="text.secondary">
            No analytics data yet. Send a campaign and interact with emails to
            see results.
          </Typography>
        )}
      <Box sx={{ mt: 2 }}>
        {/* <CardContent> */}
        <Typography variant="h6">Campaign Performance Metrics</Typography>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign</TableCell>
                <TableCell>Opens</TableCell>
                <TableCell>Clicks</TableCell>
                <TableCell>Unique</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.map((row) => (
                <TableRow
                  key={row.campaignId}
                  hover
                  sx={{
                    "&:hover": {
                      backgroundColor: "#f9fafb",
                    },
                  }}
                >
                  <TableCell>{row.subject}</TableCell>
                  <TableCell>{row.opens}</TableCell>
                  <TableCell>{row.clicks}</TableCell>
                  <TableCell>{row.uniqueSubscribers}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* </CardContent> */}
      </Box>
    </Box>
  );
}
