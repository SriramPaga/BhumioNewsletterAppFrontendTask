import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Button,
  MenuItem,
  Alert,
} from "@mui/material";

const STORAGE_KEY = "newsletter_smtp_settings";

export default function Settings() {
  const [provider, setProvider] = useState("mailgun");
  const [apiKey, setApiKey] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    // Load settings from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const settings = JSON.parse(stored);
      setProvider(settings.provider || "mailgun");
      setApiKey(settings.apiKey || "");
      setFromEmail(settings.fromEmail || "");
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (!apiKey || !fromEmail) {
      return;
    }

    const settings = { provider, apiKey, fromEmail };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSuccessMessage("Settings saved successfully!");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Settings</Typography>
        <Typography variant="body2" color="text.secondary">
          Configure email provider and SMTP settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Alert severity="info" sx={{ mb: 2 }}>
            These settings are stored locally for demo purposes and are not synced to the backend.
            In a production environment, these would be encrypted and stored securely on the server.
          </Alert>

          <Card sx={{ backgroundColor: "rgba(37, 99, 235, 0.05)" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Email Provider Configuration
              </Typography>

              <Box
                component="form"
                onSubmit={handleSave}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <TextField
                  select
                  label="Email Provider"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="mailgun">Mailgun</MenuItem>
                  <MenuItem value="sendgrid">SendGrid</MenuItem>
                  <MenuItem value="ses">AWS SES</MenuItem>
                  <MenuItem value="gmail">Gmail SMTP</MenuItem>
                </TextField>

                <TextField
                  label="API Key / SMTP Key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  required
                  helperText={`Enter your ${provider} API key`}
                  fullWidth
                />

                <TextField
                  label="From Email"
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  required
                  helperText="Email address to send campaigns from"
                  fullWidth
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={!apiKey || !fromEmail}
                >
                  Save Settings
                </Button>
              </Box>

              {successMessage && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {successMessage}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ backgroundColor: "rgba(74, 148, 117, 0.05)" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Supported Providers
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Mailgun
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Powerful email delivery platform. Excellent for campaigns and transactional emails.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    SendGrid
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reliable email service with detailed analytics and deliverability tools.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    AWS SES
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cost-effective service from Amazon. Great for high-volume sending.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Gmail SMTP
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Simple SMTP relay using your Gmail account. Best for low-volume testing.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
