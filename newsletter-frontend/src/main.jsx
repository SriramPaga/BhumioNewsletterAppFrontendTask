import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { CssBaseline } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthProvider } from "./context/AuthContext.jsx";
import { SnackbarProvider } from "./context/SnackbarContext.jsx";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#111827", // almost black (strong editorial tone)
    },
    secondary: {
      main: "#2563eb", // subtle blue accent
    },
    background: {
      default: "#f9fafb", // soft neutral
      paper: "#ffffff",
    },
    text: {
      primary: "#111827",
      secondary: "#6b7280",
    },
    divider: "#e5e7eb",
  },

  typography: {
    fontFamily: `'Inter', 'Helvetica Neue', Arial, sans-serif`,
    h4: {
      fontWeight: 600,
      letterSpacing: "-0.3px",
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      lineHeight: 1.6,
    },
    button: {
      textTransform: "none",
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
          backgroundColor: "#f9fafb",
        },
      },
    },

    // MuiCard: {
    //   styleOverrides: {
    //     root: {
    //       border: "1px solid #e5e7eb",
    //       boxShadow: "none",
    //     },
    //   },
    // },

    MuiCard: {
  styleOverrides: {
    root: {
      border: "1px solid #e5e7eb",
      borderRadius: 14,

      // 🔥 base shadow (very subtle)
      boxShadow: "0 2px 6px rgba(0,0,0,0.04)",

      // 🔥 smooth animation
      transition: "all 0.25s ease",

      // 🔥 hover effect
      "&:hover": {
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        transform: "translateY(-4px)",
        borderColor: "#d1d5db",
      },
    },
  },
},

    // MuiButton: {
    //   styleOverrides: {
    //     root: {
    //       borderRadius: 8,
    //       padding: '8px 16px',
    //     },
    //     containedPrimary: {
    //       backgroundColor: '#111827',
    //       color: '#ffffff',
    //       '&:hover': {
    //         backgroundColor: '#1f2937',
    //       },
    //     },
    //     outlined: {
    //       borderColor: '#d1d5db',
    //       color: '#111827',
    //     },
    //   },
    // },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          padding: "10px 20px",
          fontWeight: 500,
          textTransform: "none",
          transition: "all 0.25s ease",
        },

        containedPrimary: {
          background: "linear-gradient(135deg, #5BAE8B, #4A9475)",
          color: "#ffffff",
          boxShadow: "0 6px 16px rgba(74, 148, 117, 0.25)",

          "&:hover": {
            background: "linear-gradient(135deg, #4A9475, #3F8267)",
            boxShadow: "0 10px 24px rgba(74, 148, 117, 0.35)",
            transform: "translateY(-1px)",
          },

          "&:active": {
            transform: "translateY(0px)",
            boxShadow: "0 4px 10px rgba(74, 148, 117, 0.2)",
          },

          // 🔥 DISABLED STATE FIX
          "&.Mui-disabled": {
            background: "#e5e7eb", // soft grey
            color: "#9ca3af", // muted text
            boxShadow: "none",
            transform: "none",
            cursor: "not-allowed",
          },
        },

        outlined: {
          borderColor: "#d1d5db",
          color: "#111827",

          "&:hover": {
            borderColor: "#4A9475",
            color: "#4A9475",
            backgroundColor: "rgba(74, 148, 117, 0.05)",
          },

          // optional disabled for outlined
          "&.Mui-disabled": {
            borderColor: "#e5e7eb",
            color: "#9ca3af",
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: "#ffffff",
          },
        },
      },
    },

    MuiTableContainer: {
      styleOverrides: {
        root: {
          border: "1px solid #e5e7eb",
          boxShadow: "none",
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontSize: "12px",
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SnackbarProvider>
          <App />
        </SnackbarProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
