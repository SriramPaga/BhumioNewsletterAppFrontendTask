# Backend System Map

## 1. Modules

| Module | Responsibility |
|--------|----------------|
| Auth | JWT login, validation, token generation |
| Users | Registration, login, refresh, profile CRUD |
| Organizations | Org create/list, role-based access, multi-tenancy isolation |
| Subscribers | Create/list/update subscribers |
| Lists | Create lists, import CSV, segmentation |
| Campaigns | Campaign create/list/send workflows |
| ClickStats | Tracking endpoints, campaign metrics, pixel/click handlers |
| Email | SMTP delivery service via MailerModule |
| Queues | BullMQ queue health and job monitoring |
| Realtime | WebSocket stats gateway |
| Security | JWT guard, roles guard, tracking tokens |
| Tasks | Scheduled/background task support |
| Common | Config, TypeORM, Knex, throttling |

## 2. Entities

| Entity | Key Fields | Relations |
|--------|------------|-----------|
| Organization | id, name, createdAt, updatedAt | users, lists, subscribers, campaigns |
| User | id, email, fullName, password, role, refreshTokenHash | organization |
| Subscriber | id, email, customFields(JSONB), createdAt, updatedAt | organization |
| List | id, name, customFields(JSONB), createdAt, updatedAt | organization, campaigns |
| Campaign | id, subject, content, targetUrl, opened, createdAt | list, organization, clickStats |
| ClickStat | id, campaignId, opens, clicks | campaign, links, clickEvents |
| ClickEvent | id, eventType, ip, userAgent | clickStat |
| Link | id, url | campaign |
| Email | id, to, subject, html | (mailer defaults) |

## 3. Auth + Multi-Tenancy Flow

Register/Login ? JWT(userId, orgId, role) ? Request ? Guard ? orgId enforced ? DB queries scoped

## 4. Core Flows

User: Register ? (org create/assign) ? Login ? Dashboard

Lists: Create ? Import CSV ? Subscribers stored ? Linked

Campaign: Create ? Select List ? Send ? Email/Queue ? Delivered

Analytics: Open/Click ? Track endpoint ? Store ? Fetch stats

## 5. Email System

| Part | Implementation |
|------|----------------|
| Service | EmailService with @nestjs-modules/mailer |
| Queue | BullMQ email queue available, health endpoint accessible |
| SMTP | Env-driven, defaults to Mailgun/Gmail-style settings |

## 6. APIs

| Module | Key Endpoints |
|--------|---------------|
| Auth | POST /auth/login |
| Users | POST /users/register, POST /users/login, POST /users/refresh, POST /users/logout, GET/PATCH/DELETE /users/profile/:id |
| Organizations | POST /organizations, GET /organizations |
| Subscribers | POST /subscribers, GET /subscribers, PUT /subscribers/:id |
| Lists | POST /lists, GET /lists, PUT /lists/:id, POST /lists/:listId/import-csv, POST /lists/:listId/segment |
| Campaigns | POST /campaigns, GET /campaigns, POST /campaigns/:id/send |
| ClickStats | POST /click-stats, GET /click-stats, GET /click-stats/campaign/:campaignId, GET /click-stats/t/:token, GET /click-stats/o/:token |
| Queues | GET /queues/health |
| Email | POST /emails/send |

## 7. Queue

| Queue | Purpose |
|-------|---------|
| click | Process click tracking jobs |
| email | Process outgoing email dispatch |
| automation | Process automation triggers |
| dlq | Dead-letter queue for failed jobs |

## 8. Gaps

- No SMTP settings API or dynamic provider config
- No RSS campaign workflow
- No GPG encryption backend
- Templates are not persisted in backend
- Org selection UI not explicitly defined in frontend map
