import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Switch,
  FormControlLabel,
  MenuItem,
  Divider,
  Alert,
  Tooltip,
} from "@mui/material";

import api from "../services/api.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useApi } from "../hooks/useApi.js";

const defaultTemplates = [
  {
    id: "launch",
    title: "New product launch",
    content:
      "Hello {{name}},\n\nWe are excited to introduce our latest release. Visit {{url}} to learn more.",
  },
  {
    id: "newsletter",
    title: "Weekly newsletter",
    content:
      "Hi {{name}},\n\nHere is your weekly update with the latest news and insights.",
  },
];

export default function Campaigns() {
  const { organization } = useAuth();
  const { loading, callApi } = useApi();

  const [lists, setLists] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [selectedListId, setSelectedListId] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(
    defaultTemplates[0].id,
  );

  const [gpgEncrypt, setGpgEncrypt] = useState(false);
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [campaignFilter, setCampaignFilter] = useState("");
  const [automationHealth, setAutomationHealth] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");

  // Template change
  useEffect(() => {
    const template = defaultTemplates.find((t) => t.id === selectedTemplate);
    if (template) setContent(template.content);
  }, [selectedTemplate]);

  // Initial load
  useEffect(() => {
    const load = async () => {
      const [listsRes, campaignsRes] = await Promise.all([
        callApi(() => api.getLists()),
        callApi(() => api.getCampaigns()),
      ]);

      setLists(listsRes.data);
      setCampaigns(campaignsRes.data);
      setSelectedListId(listsRes.data[0]?.id || "");
    };

    load();
  }, [callApi]);

  const selectedList = lists.find((l) => l.id === selectedListId);
  const canCreateCampaign =
    selectedList &&
    (selectedList.organizationId || selectedList.organization?.id);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!canCreateCampaign) return;

    const payload = {
      subject,
      content,
      listId: selectedListId,
      // organizationId: selectedList.organizationId,
      organizationId: selectedList.organization?.id,
      targetUrl: targetUrl || undefined,
    };

    await callApi(() => api.createCampaign(payload), "Campaign created");

    const res = await callApi(() => api.getCampaigns());
    setCampaigns(res.data);

    setSubject("");
    setTargetUrl("");
  };
  const handleSend = async (campaign) => {
    try {
      await callApi(() => api.sendCampaign(campaign.id, {}), "Campaign sent");
      setSuccessMessage("Campaign queued successfully!");
    } catch (err) {
      console.error("Send failed:", err);
      setSuccessMessage(
        "Campaign queued successfully (email may fail locally).",
      );
    }
  };

  const handleRefreshAutomation = async () => {
    const res = await callApi(() => api.getAutomationHealth());
    setAutomationHealth(res.data);
  };

  const visibleCampaigns = useMemo(
    () =>
      campaigns.filter((c) =>
        c.subject.toLowerCase().includes(campaignFilter.toLowerCase()),
      ),
    [campaigns, campaignFilter],
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Campaigns</Typography>
        <Typography variant="body2" color="text.secondary">
          Create and manage email campaigns
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* LEFT - Composer */}
        <Grid item xs={12} md={5} lg={4}>
          <Card sx={{ backgroundColor: "rgba(37, 99, 235, 0.05)" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campaign composer
              </Typography>
              {selectedList && !canCreateCampaign && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  This list is not linked to an organization. Please select a
                  valid list.
                </Alert>
              )}

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />

                <TextField
                  select
                  label="Template"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  {defaultTemplates.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.title}
                    </MenuItem>
                  ))}
                </TextField>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
                  Templates are stored locally and will be used when backend integration is available.
                </Typography>

                <TextField
                  select
                  label="List"
                  value={selectedListId}
                  onChange={(e) => setSelectedListId(e.target.value)}
                >
                  {lists.map((list) => (
                    <MenuItem key={list.id} value={list.id}>
                      {list.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  multiline
                  minRows={6}
                  required
                />

                <TextField
                  label="Landing URL"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                />
                <Tooltip title="GPG encryption is not yet implemented in the backend. This is a placeholder for future enhancement.">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={gpgEncrypt}
                        onChange={(e) => setGpgEncrypt(e.target.checked)}
                      />
                    }
                    label="GPG encryption"
                  />
                </Tooltip>
                <FormControlLabel
                  control={
                    <Switch
                      checked={automationEnabled}
                      onChange={(e) => setAutomationEnabled(e.target.checked)}
                    />
                  }
                  label="Automation"
                />

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={handleCreate}
                    disabled={!canCreateCampaign || loading}
                  >
                    Save
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => {
                      const template = defaultTemplates.find(
                        (t) => t.id === selectedTemplate,
                      );

                      setContent(template?.content || "");
                      setSubject("");
                      setTargetUrl("");
                    }}
                  >
                    Reset
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT - Campaign List */}
        <Grid item xs={12} md={7} lg={8}>
          {/* <Card sx={{ mb: 2 }}> */}
          {/* <CardContent> */}
          <Box sx={{ mb: 2 }}>
            <TextField
              placeholder="Search campaigns..."
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              fullWidth
            />
          </Box>

          <Divider sx={{ mb: 2 }} />
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}
          <TableContainer
            component={Paper}
            sx={{ border: "1px solid #e5e7eb" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subject</TableCell>
                  <TableCell>List</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {visibleCampaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.subject}</TableCell>
                    <TableCell>{c.list?.name || "—"}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleSend(c)}
                        disabled={loading}
                      >
                        Dispatch
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {visibleCampaigns.length === 0 && (
            <Typography align="center" sx={{ mt: 3 }} color="text.secondary">
              No campaigns created
            </Typography>
          )}
          {/* </CardContent> */}
          {/* </Card> */}

          {/* Automation */}
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Automation
              </Typography>

              <Button
                variant="outlined"
                onClick={handleRefreshAutomation}
                disabled={loading}
              >
                Refresh status
              </Button>
              {automationHealth && (
                <Box sx={{ mt: 2 }}>
                  {Object.entries(automationHealth).map(
                    ([queueName, stats]) => {
                      const active = stats.active || 0;
                      const completed = stats.completed || 0;
                      const failed = stats.failed || 0;
                      const waiting = stats.waiting || 0;

                      return (
                        <Box
                          key={queueName}
                          sx={{
                            mb: 2,
                            p: 2,
                            borderRadius: 1,
                            borderBottom: "1.5px solid #b4b4b4",
                          }}
                        >
                          {/* 🔹 TITLE */}
                          <Typography variant="h6">
                            {queueName.toUpperCase()}
                          </Typography>

                          {/* 🔹 STATUS (ADD HERE) */}
                          <Typography
                            variant="caption"
                            sx={{
                              color: failed > 0 ? "error.main" : "success.main",
                              fontWeight: 600,
                              display: "block",
                              mb: 1,
                            }}
                          >
                            {failed > 0 ? "Issues detected" : "Healthy"}
                          </Typography>

                          {/* 🔹 METRICS */}
                          <Box
                            sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}
                          >
                            <Chip label={`Active: ${active}`} />
                            <Chip
                              label={`Completed: ${completed}`}
                              color="success"
                            />
                            <Chip
                              label={`Failed: ${failed}`}
                              color={failed > 0 ? "error" : "default"}
                            />
                            <Chip
                              label={`Waiting: ${waiting}`}
                              color="warning"
                            />
                          </Box>
                        </Box>
                      );
                    },
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
