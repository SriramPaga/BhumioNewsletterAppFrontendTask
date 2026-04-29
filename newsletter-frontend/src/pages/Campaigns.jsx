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
  Alert
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
      organizationId: selectedList.organizationId,
      targetUrl: targetUrl || undefined,
    };

    await callApi(() => api.createCampaign(payload), "Campaign created");

    const res = await callApi(() => api.getCampaigns());
    setCampaigns(res.data);

    setSubject("");
    setTargetUrl("");
  };

  const handleSend = async (campaign) => {
    await callApi(() => api.sendCampaign(campaign.id, {}), "Campaign sent");
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
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Campaign composer
              </Typography>


              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Title"
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

                <FormControlLabel
                  control={
                    <Switch
                      checked={gpgEncrypt}
                      onChange={(e) => setGpgEncrypt(e.target.checked)}
                    />
                  }
                  label="GPG encryption"
                />

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
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <TextField
                  placeholder="Search campaigns..."
                  value={campaignFilter}
                  onChange={(e) => setCampaignFilter(e.target.value)}
                  fullWidth
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              <TableContainer
                component={Paper}
                sx={{ border: "1px solid #e5e7eb" }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
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
                <Typography
                  align="center"
                  sx={{ mt: 3 }}
                  color="text.secondary"
                >
                  No campaigns created
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Automation */}
          <Card>
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
                  {Object.entries(automationHealth).map(([key, val]) => (
                    <Chip key={key} label={`${key}`} sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
