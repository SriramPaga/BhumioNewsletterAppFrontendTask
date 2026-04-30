# Newsletter Frontend

A React + Material UI frontend for a newsletter management system that integrates with a provided NestJS backend.

## Project Overview

This app manages subscribers, lists, segmentation, campaigns, and analytics from a frontend perspective.
It is designed to consume backend APIs and present a clean workflow for newsletter operations.

## Key Highlights

- Backend API mapping is central: subscribers, lists, campaigns, analytics, and auth are all driven through a shared API service.
- Segmentation is organization-level: lists provide context and filter presets, but subscribers are stored on the organization side.
- Fixed a backend integration issue with JSONB custom field queries so segmentation correctly filters subscriber data.
- Backend limitations are handled transparently in the UI: SMTP settings and templates are frontend-only placeholders, and analytics values rely on real delivery.

## Features Implemented

- JWT authentication and global auth context
- Subscriber creation with dynamic custom fields
- CSV subscriber import
- List management and context-based segmentation
- Campaign creation and dispatch to backend queue
- Analytics dashboard for campaign performance
- Local template editor with storage in browser storage
- SMTP/settings UI for frontend configuration only
- User profile and organization display

## Architecture

- **AuthContext** handles token storage, user state, and authorization for API calls.
- **API service layer** centralizes backend requests, auth attachment, and error handling.
- **State management** is kept simple with React hooks and local component state.

## Known Limitations

- Lists are not directly linked to subscribers in the current backend model.
- Email sending is not configured in this demo environment.
- Analytics depends on actual campaign delivery and tracking events.
- Templates are stored locally in the browser and do not persist to the backend.

## Setup Instructions

1. Install dependencies:
   ```bash
   cd newsletter-frontend
   npm install
   ```
2. Run the frontend:
   ```bash
   npm run dev
   ```
3. Note: the frontend requires the provided NestJS backend to be running for API access.

## Demo

- Video: [Add demo link here]
