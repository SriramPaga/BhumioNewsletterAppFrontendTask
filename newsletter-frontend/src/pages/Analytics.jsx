import { useEffect, useState } from 'react';
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
} from '@mui/material';
import api from '../services/api.js';

export default function Analytics() {
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const campaignsRes = await api.getCampaigns();
        setCampaigns(campaignsRes.data);
        const statsPromises = campaignsRes.data.map((campaign) =>
          api.getCampaignStats(campaign.id).then((res) => ({ ...res.data, subject: campaign.subject })),
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
      <Typography variant="h4" mb={2}>
        Analytics
      </Typography>
      {message && <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Campaigns tracked</Typography>
              <Typography variant="h3" sx={{ mt: 2 }}>
                {campaigns.length}
              </Typography>
              <Typography color="text.secondary">Total campaigns loaded from backend.</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6">Top metrics</Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography color="text.secondary">Opens</Typography>
                    <Typography variant="h5">{stats.reduce((sum, item) => sum + Number(item.opens || 0), 0)}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography color="text.secondary">Clicks</Typography>
                    <Typography variant="h5">{stats.reduce((sum, item) => sum + Number(item.clicks || 0), 0)}</Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography color="text.secondary">Unique subscribers</Typography>
                    <Typography variant="h5">{stats.reduce((sum, item) => sum + Number(item.uniqueSubscribers || 0), 0)}</Typography>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="h6">Campaign stats</Typography>
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
                  <TableRow key={row.campaignId}>
                    <TableCell>{row.subject}</TableCell>
                    <TableCell>{row.opens}</TableCell>
                    <TableCell>{row.clicks}</TableCell>
                    <TableCell>{row.uniqueSubscribers}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
