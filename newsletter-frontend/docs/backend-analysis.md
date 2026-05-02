# Backend Analysis

## 1. Entity relationships

- **Subscriber** (`src/subscribers/entities/subscriber.entity.ts`)
  - Fields: `id`, `email`, `organization`, `customFields` (JSONB), `createdAt`, `updatedAt`
  - Relationship: `ManyToOne` → `Organization`

- **List** (`src/lists/entities/list.entity.ts`)
  - Fields: `id`, `name`, `organization`, `customFields` (JSONB), `createdAt`, `updatedAt`
  - Relationship: `ManyToOne` → `Organization`
  - Also relates to `Campaign` via `OneToMany`

- **Organization** (`src/organizations/entities/organization.entity.ts`)
  - Fields: `id`, `name`, `createdAt`, `updatedAt`
  - Relationships: `OneToMany` → `lists`, `subscribers`, `users`, `campaigns`

- **Subscriber → List**
  - Direct link: **No**
  - Subscribers are not stored with a `listId` or list relation in the schema.

## 2. Data flow

- **Subscriber creation**
  - `SubscriberService.create()` builds a `Subscriber`, assigns `organization` if `organizationId` is provided, saves to `subscribers` table.
  - No list association is created.

- **List creation**
  - `ListService.create()` saves a `List` with optional `organizationId` and `customFields`.
  - Lists serve as organization-scoped metadata containers.

- **CSV import**
  - `ListService.importCsv(listId, filePath)` reads uploaded CSV via `fast-csv`.
  - Each row must contain an `email` column.
  - Creates `Subscriber` records with `email`, `customFields`, and the list’s `organization`.
  - Existing org subscribers are deduplicated by email before insert.
  - File is deleted after processing.

## 3. Segmentation logic

- Implemented in `ListService.segmentSubscribers()`.
- Steps:
  - Load list by `listId` and require its `organization`.
  - Combine request `filters` with `list.customFields`.
  - Start query with `subscriber.organizationId = list.organization.id`.
  - For each filter key except `organizationId`, validate it and add:
    - `LOWER(subscriber.customFields ->> 'key') = LOWER(:value_key)`
- **ListId effect**
  - `listId` is only used to identify the organization and list default filters.
  - It does not require subscribers to belong to the list.

## 4. Actual system behavior

- **Does a list contain subscribers?**
  - No, not in the database schema.
  - Subscribers are linked only to organizations.

- **Segmentation scope**
  - Organization-based: results are filtered by the list’s organization.
  - List metadata can add extra custom-field filters, but list membership is not enforced.

- **Role of lists**
  - Stores a name, org association, and optional custom field defaults.
  - Acts as a filter source for segmentation and as a container for campaigns.
  - Does not act as a physical subscriber group.

## 5. Design gaps / inconsistencies

- Missing explicit `Subscriber` → `List` relation.
- CSV import adds subscribers to the organization, not to a specific list.
- `POST /lists/:listId/segment` suggests list-based segmentation, but backend uses organization scope.
- `List.customFields` are merged into segmentation filters, which makes lists behave like static filter presets rather than membership containers.
- UI expectations for list membership are not reflected in backend data model.
