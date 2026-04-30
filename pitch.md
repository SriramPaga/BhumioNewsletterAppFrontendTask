# Newsletter App Pitch

## Core Features

- **Subscriber Management**: frontend supports add subscriber form, CSV upload, and custom fields; backend provides `/subscribers` CRUD.
- **List Management**: frontend list creation and segmentation UI; backend supports `/lists`, `/lists/:listId/import-csv`, `/lists/:listId/segment`.
- **Campaign Workflow**: campaign composer, template selection, list assignment, and send action; backend handles `/campaigns` and `/campaigns/:id/send`.
- **Analytics**: campaign metrics dashboard with opens, clicks, and unique counts; backend exposes `/click-stats` and `/click-stats/campaign/:id`.
- **Template Editor**: reusable campaign templates with preview and local draft persistence.
- **SMTP Settings UI**: local provider/config form for demo workflow.

## Frontend Implementation

| Feature | UI Page | Notes |
|---|---|---|
| Subscriber management | `Subscribers.jsx` | add form, CSV upload, custom fields |
| Lists + segmentation | `Lists.jsx` | create lists, dynamic filter fields |
| Campaigns | `Campaigns.jsx` | composer, templates, send workflow |
| Analytics | `Analytics.jsx` | performance metrics and tables |
| Templates | `Templates.jsx` | editor, preview, localStorage persistence |
| Settings | `Settings.jsx` | SMTP provider form, demo-mode storage |
| Auth | `Login.jsx` + `ProtectedRoute` | JWT login, protected app shell |

## API Integration Status

- **Full**: Subscribers, Lists, Campaigns, Analytics
- **Partial**: Templates (local-only), Settings (demo local persistence), Users UI (mocked preview only)
- **None**: GPG encryption backend, RSS campaign automation

## Key Design Decisions

- Auth state is stored in `AuthContext` with `localStorage` persistence.
- `useApi` centralizes async loading, error handling, and snackbar notifications.
- `services/api.js` provides a single Axios layer with auth headers and org scoping.
- UI uses Material UI for consistent dashboard layout, responsive grids, cards, and form controls.
- No global state library: page-level state with hooks keeps the app lightweight.

## Backend Limitations Handled in Frontend

- SMTP settings are stored locally instead of backend-backed configuration.
- Template persistence is demo-only via browser storage.
- GPG encryption appears as a UI placeholder with explanatory tooltip.
- User management is surfaced as a partial interface without backend CRUD.

## Key Highlights

- Dynamic segmentation fields derived from subscriber custom metadata.
- Flexible subscriber custom fields support arbitrary JSON key/value pairs.
- Clean API integration with auth and organization context centralized.
- Polished, recruiter-friendly MUI dashboard and navigation.
- Demo-safe handling of email and persistence gaps while preserving core flows.
