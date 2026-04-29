import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';

const STORAGE_KEY = 'newsletter_templates';

export default function Templates() {
  const [templates, setTemplates] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setTemplates(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  const handleSave = () => {
    if (!title || !content) return;

    const next = [
      ...templates,
      { id: Date.now().toString(), title, content },
    ];

    setTemplates(next);
    setTitle('');
    setContent('');
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Templates</Typography>
        <Typography variant="body2" color="text.secondary">
          Create reusable content blocks for campaigns
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* LEFT - Editor */}
        <Grid item xs={12} md={5} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                New template
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <TextField
                  label="Content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  multiline
                  minRows={10}
                  required
                />

                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={!title || !content}
                >
                  Save template
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT - Templates List */}
        <Grid item xs={12} md={7} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Templates
              </Typography>

              <List>
                {templates.map((template) => (
                  <Box key={template.id}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => setSelected(template)}
                        selected={selected?.id === template.id}
                      >
                        <ListItemText
                          primary={template.title}
                          secondary={
                            template.content.length > 80
                              ? template.content.slice(0, 80) + '...'
                              : template.content
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    <Divider />
                  </Box>
                ))}

                {!templates.length && (
                  <Typography
                    align="center"
                    sx={{ py: 4 }}
                    color="text.secondary"
                  >
                    No templates created
                  </Typography>
                )}
              </List>

              {/* Preview */}
              {selected && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>
                    Preview
                  </Typography>

                  <Box
                    sx={{
                      border: '1px solid #e5e7eb',
                      borderRadius: 1,
                      p: 2,
                      backgroundColor: '#fff',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {selected.title}
                    </Typography>

                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>
                      {selected.content}
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}