import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  MenuItem,
  Divider,
} from "@mui/material";
import api from "../services/api.js";
import { formatDate } from "../utils/format.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useApi } from "../hooks/useApi.js";

function CustomFieldInputs({ fields, onChange }) {
  const addField = () => onChange([...fields, { key: "", value: "" }]);

  const updateField = (index, key, value) => {
    const next = [...fields];
    next[index][key] = value;
    onChange(next);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {fields.map((field, index) => (
        <Grid container spacing={1} key={index}>
          <Grid item xs={5}>
            <TextField
              label="Field name"
              value={field.key}
              fullWidth
              onChange={(e) => updateField(index, "key", e.target.value)}
            />
          </Grid>
          <Grid item xs={5}>
            <TextField
              label="Field value"
              value={field.value}
              fullWidth
              onChange={(e) => updateField(index, "value", e.target.value)}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              onClick={() => onChange(fields.filter((_, i) => i !== index))}
            >
              Remove
            </Button>
          </Grid>
        </Grid>
      ))}
      <Button size="small" onClick={addField}>
        + Add field
      </Button>
    </Box>
  );
}

export default function Subscribers() {
  const { organization } = useAuth();
  const { loading, callApi } = useApi();

  const [subscribers, setSubscribers] = useState([]);
  const [lists, setLists] = useState([]);
  const [email, setEmail] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [customFields, setCustomFields] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedListId, setSelectedListId] = useState("");

  useEffect(() => {
    const load = async () => {
      const [subsRes, listsRes] = await Promise.all([
        callApi(() => api.getSubscribers()),
        callApi(() => api.getLists()),
      ]);
      setSubscribers(subsRes.data);
      setLists(listsRes.data);
      setSelectedListId(listsRes.data[0]?.id || "");
    };
    load();
  }, [callApi]);

  const filteredSubscribers = useMemo(
    () =>
      subscribers.filter((s) =>
        s.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [subscribers, search],
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    console.log("Submit triggered");
    if (!selectedListId) {
      console.log("No list selected");
      return;
    }
    console.log("Proceeding to create subscriber...");

    const customObject = customFields.reduce((acc, field) => {
      if (field.key && field.value) acc[field.key] = field.value;
      return acc;
    }, {});

    const payload = {
      email,
      // organizationId: organization.id,
      customFields: {
        ...customObject,
        publicKey: publicKey || undefined,
      },
    };

    await callApi(() => api.createSubscriber(payload), "Subscriber added");

    const subsRes = await callApi(() => api.getSubscribers());
    setSubscribers(subsRes.data);

    setEmail("");
    setPublicKey("");
    setCustomFields([]);
  };

  const handleUpload = async () => {
    if (!csvFile || !selectedListId) return;

    await callApi(() => api.importCsv(selectedListId, csvFile), "CSV uploaded");

    const subsRes = await callApi(() => api.getSubscribers());
    setSubscribers(subsRes.data);
    setCsvFile(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Subscribers</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage and organize your audience
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* LEFT SIDE */}
        <Grid item xs={12} md={5} lg={4}>
          {/* Add Subscriber */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Add subscriber
              </Typography>

              <Box
                component="form"
                onSubmit={handleCreate}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <TextField
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

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
                  label="Public key (optional)"
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  multiline
                  minRows={3}
                />

                <CustomFieldInputs
                  fields={customFields}
                  onChange={setCustomFields}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={!selectedListId || loading}
                >
                  Add subscriber
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* CSV Upload */}
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Import CSV
              </Typography>

              <Button component="label" variant="outlined" fullWidth>
                Select file
                <input
                  hidden
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
              </Button>

              {csvFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {csvFile.name}
                </Typography>
              )}

              <Button
                sx={{ mt: 2 }}
                variant="contained"
                fullWidth
                disabled={!csvFile || !selectedListId}
                onClick={handleUpload}
              >
                Upload CSV
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT SIDE */}
        <Grid item xs={12} md={7} lg={8}>
          <Card>
            <CardContent>
              {/* Search */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  placeholder="Search subscribers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  fullWidth
                />
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Table */}
              <TableContainer
                component={Paper}
                sx={{ border: "1px solid #e5e7eb" }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell>Organization</TableCell>
                      <TableCell>Custom fields</TableCell>
                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {filteredSubscribers.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.email}</TableCell>
                        <TableCell>{s.organization?.name || "—"}</TableCell>
                        <TableCell>
                          {Object.entries(s.customFields || {}).map(
                            ([k, v]) => (
                              <Chip
                                key={k}
                                label={`${k}: ${v}`}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ),
                          )}
                        </TableCell>
                        <TableCell>{formatDate(s.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {filteredSubscribers.length === 0 && (
                <Typography
                  align="center"
                  sx={{ mt: 4 }}
                  color="text.secondary"
                >
                  No subscribers found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
