import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Divider,
} from '@mui/material';
import api from '../services/api.js';
import { formatDate } from '../utils/format.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { useApi } from '../hooks/useApi.js';

const segmentFields = ['email', 'createdAt'];

export default function Lists() {
  const { organization } = useAuth();
  const { loading, callApi } = useApi();

  const [lists, setLists] = useState([]);
  const [name, setName] = useState('');
  const [customFieldKey, setCustomFieldKey] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');
  const [segmentKey, setSegmentKey] = useState('');
  const [segmentValue, setSegmentValue] = useState('');
  const [segmentResults, setSegmentResults] = useState([]);
  const [selectedListId, setSelectedListId] = useState('');

  useEffect(() => {
    const load = async () => {
      const response = await callApi(() => api.getLists());
      setLists(response.data);
      setSelectedListId(response.data[0]?.id || '');
    };
    load();
  }, [callApi]);

  const selectedList = useMemo(
    () => lists.find((item) => item.id === selectedListId),
    [lists, selectedListId]
  );

  const availableSegmentFields = useMemo(() => {
    const custom = selectedList?.customFields
      ? Object.keys(selectedList.customFields)
      : [];
    return [...segmentFields, ...custom];
  }, [selectedList]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!organization) return;

    const payload = {
      name,
      organizationId: organization.id,
      customFields: customFieldKey
        ? { [customFieldKey]: customFieldValue }
        : undefined,
    };

    await callApi(() => api.createList(payload), 'List created');

    const response = await callApi(() => api.getLists());
    setLists(response.data);

    setName('');
    setCustomFieldKey('');
    setCustomFieldValue('');
  };

  const handleSegment = async () => {
    if (!selectedListId || !segmentKey || !segmentValue) return;

    const response = await callApi(() =>
      api.segmentSubscribers(selectedListId, {
        [segmentKey]: segmentValue,
      })
    );

    setSegmentResults(response.data.data || []);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Lists</Typography>
        <Typography variant="body2" color="text.secondary">
          Organize subscribers and define segmentation rules
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* LEFT SIDE */}
        <Grid item xs={12} md={5} lg={4}>
          {/* Create List */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Create list
              </Typography>

              <Box
                component="form"
                onSubmit={handleCreate}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                <TextField
                  label="List name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <TextField
                  label="Custom field key"
                  value={customFieldKey}
                  onChange={(e) => setCustomFieldKey(e.target.value)}
                />

                <TextField
                  label="Custom field value"
                  value={customFieldValue}
                  onChange={(e) => setCustomFieldValue(e.target.value)}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={!organization || loading}
                >
                  Create list
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Segment */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Segment subscribers
              </Typography>

              <TextField
                select
                label="List"
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              >
                {lists.map((list) => (
                  <MenuItem key={list.id} value={list.id}>
                    {list.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Field"
                value={segmentKey}
                onChange={(e) => setSegmentKey(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              >
                {availableSegmentFields.map((field) => (
                  <MenuItem key={field} value={field}>
                    {field}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Value"
                value={segmentValue}
                onChange={(e) => setSegmentValue(e.target.value)}
                fullWidth
              />

              <Button
                sx={{ mt: 2 }}
                variant="contained"
                onClick={handleSegment}
                disabled={!segmentKey || !segmentValue || loading}
              >
                Run segment
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT SIDE */}
        <Grid item xs={12} md={7} lg={8}>
          {/* Lists Table */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Lists
              </Typography>

              {lists.length === 0 ? (
                <Typography align="center" sx={{ py: 4 }} color="text.secondary">
                  No lists created
                </Typography>
              ) : (
                <TableContainer
                  component={Paper}
                  sx={{ border: '1px solid #e5e7eb' }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Organization</TableCell>
                        <TableCell>Custom fields</TableCell>
                        <TableCell>Created</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {lists.map((list) => (
                        <TableRow key={list.id}>
                          <TableCell>{list.name}</TableCell>
                          <TableCell>
                            {list.organization?.name || '—'}
                          </TableCell>
                          <TableCell>
                            {list.customFields
                              ? JSON.stringify(list.customFields)
                              : '—'}
                          </TableCell>
                          <TableCell>
                            {formatDate(list.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          {/* Segment Results */}
          {segmentResults.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Segment results
                </Typography>

                <Divider sx={{ mb: 2 }} />

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Email</TableCell>
                        <TableCell>Custom fields</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {segmentResults.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.email}</TableCell>
                          <TableCell>
                            {s.customFields
                              ? JSON.stringify(s.customFields)
                              : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}