import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthProvider } from './context/AuthContext.jsx';
import { SnackbarProvider } from './context/SnackbarContext.jsx';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#111827', // almost black (strong editorial tone)
    },
    secondary: {
      main: '#2563eb', // subtle blue accent
    },
    background: {
      default: '#f9fafb', // soft neutral
      paper: '#ffffff',
    },
    text: {
      primary: '#111827',
      secondary: '#6b7280',
    },
    divider: '#e5e7eb',
  },

  typography: {
    fontFamily: `'Inter', 'Helvetica Neue', Arial, sans-serif`,
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.3px',
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },

  shape: {
    borderRadius: 10,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f9fafb',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e5e7eb',
          boxShadow: 'none',
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        containedPrimary: {
          backgroundColor: '#111827',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#1f2937',
          },
        },
        outlined: {
          borderColor: '#d1d5db',
          color: '#111827',
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#ffffff',
          },
        },
      },
    },

    MuiTableContainer: {
      styleOverrides: {
        root: {
          border: '1px solid #e5e7eb',
          boxShadow: 'none',
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontSize: '12px',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);