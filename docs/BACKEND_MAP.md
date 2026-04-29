# BACKEND_MAP.md

## Auth & Multi-Tenancy
- **OrgId Handling**: Passed via JWT claims and validated in guards.
- **UserId Handling**: Passed via JWT claims and validated in guards.

## Endpoint Registry
| Method | URL                  | DTO/Payload Shape                          | Response Shape |
|--------|----------------------|--------------------------------------------|----------------|
| POST   | /campaigns           | `{ subject: string, content: string, listId: string, organizationId: string }` | `{ id: string, subject: string, content: string, ... }` |
| GET    | /campaigns           | None                                       | `[{ id: string, subject: string, ... }]` |
| POST   | /campaigns/:id/send  | `{ country?: string, tag?: string }`       | `{ success: boolean }` |

## Database Logic
- **Subscribers**: Belong to an organization. Linked to lists.
- **Lists**: Belong to an organization. Linked to campaigns.
- **Campaigns**: Belong to an organization. Linked to lists.

## Key Logic
1. **CSV Imports**: Validated and sanitized before processing. Imported subscribers are linked to lists.
2. **GPG Encryption**: Not implemented in the current codebase.
3. **RSS Triggers**: Not implemented in the current codebase.

## API Endpoints

### Auth
| Method | URL         | DTO/Payload Shape                  | Response Shape |
|--------|-------------|------------------------------------|----------------|
| POST   | /auth/login | `{ email: string, password: string }` | `{ accessToken: string, ... }` |

### Campaigns
| Method | URL                  | DTO/Payload Shape                          | Response Shape |
|--------|----------------------|--------------------------------------------|----------------|
| POST   | /campaigns           | `{ subject: string, content: string, listId: string, organizationId: string }` | `{ id: string, subject: string, content: string, ... }` |
| GET    | /campaigns           | None                                       | `[{ id: string, subject: string, ... }]` |
| POST   | /campaigns/:id/send  | `{ country?: string, tag?: string }`       | `{ success: boolean }` |

### Click Stats
| Method | URL                          | DTO/Payload Shape                          | Response Shape |
|--------|------------------------------|--------------------------------------------|----------------|
| POST   | /click-stats                 | `{ campaignId: string, ... }`              | `{ id: string, ... }` |
| GET    | /click-stats                 | None                                       | `[{ id: string, ... }]` |
| GET    | /click-stats/campaign/:id    | `{ organizationId: string }`              | `{ stats: [...], ... }` |