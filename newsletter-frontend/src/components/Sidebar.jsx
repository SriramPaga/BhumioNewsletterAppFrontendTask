import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ListIcon from "@mui/icons-material/List";
import CampaignIcon from "@mui/icons-material/Send";
import TemplateIcon from "@mui/icons-material/Article";
import AnalyticsIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupsIcon from "@mui/icons-material/Groups";
const iconColors = {
  dashboard: "#64748B", //Slate Blue
  subscribers: "#4A9475", // muted green
  lists: "#4F46E5", // indigo
  campaigns: "#2563EB", // soft blue
  templates: "#7C3AED", // Deep Purple
  analytics: "#0891B2", // teal
  profile: "#9333EA", // purple
  settings: "#965730", // amber
};
const navItems = [
  {
    label: "Dashboard",
    to: "/",
    icon: (
      <DashboardIcon fontSize="small" sx={{ color: iconColors.dashboard }} />
    ),
  },
  {
    label: "Subscribers",
    to: "/subscribers",
    icon: (
      <PeopleIcon fontSize="small" sx={{ color: iconColors.subscribers }} />
    ),
  },
  {
    label: "Lists",
    to: "/lists",
    icon: <ListIcon fontSize="small" sx={{ color: iconColors.lists }} />,
  },
  {
    label: "Campaigns",
    to: "/campaigns",
    icon: (
      <CampaignIcon fontSize="small" sx={{ color: iconColors.campaigns }} />
    ),
  },
  {
    label: "Templates",
    to: "/templates",
    icon: (
      <TemplateIcon fontSize="small" sx={{ color: iconColors.templates }} />
    ),
  },
  {
    label: "Analytics",
    to: "/analytics",
    icon: (
      <AnalyticsIcon fontSize="small" sx={{ color: iconColors.analytics }} />
    ),
  },
  {
    label: "profile",
    to: "/profile",
    icon: (
      <GroupsIcon fontSize="small" sx={{ color: iconColors.profile }} />
    ),
  },
   {
    label: "Settings",
    to: "/settings",
    icon: (
      <SettingsIcon fontSize="small" sx={{ color: iconColors.settings }} />
    ),
  },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerWidth = 240;

  const drawer = (
    <Box
      sx={{
        height: "100%",
        bgcolor: "#ffffff",
        borderRight: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo / Brand */}
      <Toolbar sx={{ px: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Sphinx
        </Typography>
      </Toolbar>

      <Divider />

      {/* Navigation */}
      <List sx={{ px: 1, py: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={item.to}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1,
                color: "text.primary",

                "& .MuiListItemIcon-root": {
                  color: "text.secondary",
                  minWidth: 36,
                },

                "&.active": {
                  bgcolor: "#f3f4f6",
                  fontWeight: 500,

                  "& .MuiListItemIcon-root": {
                    color: "text.primary",
                  },
                },

                "&:hover": {
                  bgcolor: "#f9fafb",
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
      {/* Desktop */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "none",
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
          },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
