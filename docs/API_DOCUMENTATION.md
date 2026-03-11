# API Documentation

Complete REST API reference for the SIAGA Backend. All endpoints are prefixed with `/api`.

Base URL: `http://localhost:3000/api` (development)

---

## Table of Contents

- [Authentication](#authentication)
- [Response Format](#response-format)
- [Health Check](#health-check)
- [Auth](#auth)
- [Reports](#reports)
- [Positive Actions](#positive-actions)
- [Comments](#comments)
- [AI Chat](#ai-chat)
- [Notifications](#notifications)
- [Device Tokens](#device-tokens)
- [Area Status](#area-status)
- [Info Articles](#info-articles)
- [Activities](#activities)
- [File Upload](#file-upload)
- [Feedback](#feedback)
- [Bookmarks](#bookmarks)
- [Admin](#admin)
- [BMKG](#bmkg)

---

## Authentication

All authenticated endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

Tokens are issued by Supabase Auth on login and verified by the backend's `authMiddleware`.

---

## Response Format

All endpoints return a consistent JSON structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

---

## Health Check

### `GET /api/health`

Server health check endpoint. No authentication required.

**Response:**
```json
{
  "success": true,
  "message": "SIAGA Backend is running",
  "data": {
    "uptime": 12345,
    "timestamp": "2026-03-06T10:00:00Z"
  }
}
```

---

## Auth

### `POST /api/auth/register`

Register a new user account.

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | Valid email address |
| `password` | string | Yes | Minimum 6 characters |
| `fullName` | string | Yes | User display name |
| `phone` | string | No | Phone number |
| `district` | string | No | District/kecamatan |
| `city` | string | No | City |
| `province` | string | No | Province |
| `role` | string | No | `user` (default) or `pemerintah` |

**Response:** `201 Created` — Returns JWT token and user profile.

---

### `POST /api/auth/login`

Authenticate and receive a JWT token.

| Field | Type | Required |
|---|---|---|
| `email` | string | Yes |
| `password` | string | Yes |

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "refreshToken": "...",
    "user": {
      "id": "uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "ecoPoints": 120,
      "district": "Coblong"
    }
  }
}
```

---

### `GET /api/auth/me`

Get the authenticated user's profile. **Auth required.**

---

### `PATCH /api/auth/profile`

Update user profile fields. **Auth required.**

| Field | Type | Description |
|---|---|---|
| `fullName` | string | Display name |
| `phone` | string | Phone number |
| `bio` | string | User biography |
| `district` | string | District |
| `city` | string | City |
| `province` | string | Province |
| `nip` | string | Gov: employee ID |
| `jabatan` | string | Gov: position title |
| `instansi` | string | Gov: agency name |

---

### `PATCH /api/auth/settings`

Update user settings. **Auth required.**

---

### `POST /api/auth/change-password`

Change the authenticated user's password. **Auth required.**

| Field | Type | Required |
|---|---|---|
| `currentPassword` | string | Yes |
| `newPassword` | string | Yes |

---

### `POST /api/auth/logout`

Logout and invalidate session. **Auth required.**

---

### `POST /api/auth/forgot-password`

Send a password reset email via Supabase.

| Field | Type | Required |
|---|---|---|
| `email` | string | Yes |

---

## Reports

### `GET /api/reports`

List reports with optional filtering and pagination. Auth optional (provides `hasVoted` flag when authenticated).

| Query Param | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `status` | string | — | Filter by status |
| `category` | string | — | Filter by category |
| `district` | string | — | Filter by district |
| `search` | string | — | Search in title/description |

---

### `GET /api/reports/stats`

Aggregated report statistics for dashboard displays.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 142,
    "menunggu": 45,
    "diverifikasi": 23,
    "ditangani": 38,
    "selesai": 36
  }
}
```

---

### `GET /api/reports/nearby`

Get reports near a geographic coordinate.

| Query Param | Type | Required | Description |
|---|---|---|---|
| `lat` | number | Yes | Latitude |
| `lng` | number | Yes | Longitude |
| `radius` | number | No | Radius in km (default: 5) |

---

### `GET /api/reports/map-markers`

Lightweight report data optimized for map marker rendering.

---

### `GET /api/reports/:id`

Get full report detail including resolution proof fields. Auth optional (provides `hasVoted`, `hasVerified` flags).

**Response includes:**
```json
{
  "data": {
    "id": "uuid",
    "title": "...",
    "status": "Selesai",
    "resolution_notes": "Jalan telah diperbaiki oleh tim PU.",
    "resolution_image_url": "https://..."
  }
}
```

---

### `POST /api/reports`

Create a new report. **Auth required.**

| Field | Type | Required | Description |
|---|---|---|---|
| `category` | string | Yes | Report category |
| `title` | string | Yes | Report title |
| `description` | string | Yes | Detailed description |
| `address` | string | Yes | Location address |
| `lat` | number | Yes | Latitude coordinate |
| `lng` | number | Yes | Longitude coordinate |
| `district` | string | No | District name |
| `photo_urls` | string[] | No | Array of photo URLs |

Triggers: `+10 eco-points`, notifications to nearby users and gov.

---

### `POST /api/reports/:id/vote`

Toggle vote/support on a report. **Auth required.**

**Response:**
```json
{
  "data": {
    "voted": true,
    "votesCount": 15,
    "urgency": 42
  }
}
```

Triggers: `+2 eco-points` (on first vote), notification to reporter.

---

### `POST /api/reports/:id/verify`

Verify a report's validity. **Auth required.**

Triggers: `+5 eco-points`, notification to reporter.

---

### `PATCH /api/reports/:id/status`

Update report status. **Auth required. Gov/Admin role only.**

| Field | Type | Required | Values |
|---|---|---|---|
| `status` | string | Yes | `Diverifikasi`, `Ditangani`, `Selesai` |
| `resolution_notes` | string | No | Text notes for resolution proof (when setting `Selesai`) |
| `resolution_image_url` | string | No | URL of resolution evidence photo |

Triggers: notifications to reporter and supporters. Supabase Realtime update.

---

### `PATCH /api/reports/:id/resolve-by-user`

Allow the reporter to close their own report. **Auth required.**

---

## Positive Actions

### `GET /api/actions`

List positive actions with pagination.

| Query Param | Type | Default |
|---|---|---|
| `page` | number | 1 |
| `limit` | number | 10 |

---

### `GET /api/actions/:id`

Get full action detail including participant list.

---

### `POST /api/actions`

Create a new positive action. **Auth required.**

| Field | Type | Required |
|---|---|---|
| `category` | string | Yes |
| `title` | string | Yes |
| `description` | string | Yes |
| `address` | string | Yes |
| `lat` | number | No |
| `lng` | number | No |
| `date` | string | No |
| `duration` | string | No |

Triggers: `+50 eco-points`.

---

### `POST /api/actions/:id/join`

Join a positive action. **Auth required.**

---

### `DELETE /api/actions/:id/join`

Leave a positive action. **Auth required.**

---

## Comments

### `GET /api/comments/:targetType/:targetId`

Get comments for a report or action.

| URL Param | Type | Values |
|---|---|---|
| `targetType` | string | `report` or `action` |
| `targetId` | string | UUID of the target |

---

### `POST /api/comments`

Add a comment. **Auth required.**

| Field | Type | Required |
|---|---|---|
| `targetId` | string | Yes |
| `targetType` | string | Yes |
| `text` | string | Yes |

Triggers: `+2 eco-points`, notification to report/action owner.

---

## AI Chat

### `POST /api/chat`

Send a message to the Gemini AI assistant. **Auth required.**

| Field | Type | Required |
|---|---|---|
| `message` | string | Yes |

**Response:**
```json
{
  "success": true,
  "data": {
    "reply": "AI response text..."
  }
}
```

> [!NOTE]
> The AI assistant is limited to disaster preparedness, safety, and medical topics via system instruction. Off-topic queries receive a polite redirect.

---

## Notifications

### `GET /api/notifications`

Get the authenticated user's notification inbox. **Auth required.**

**Response includes:**
```json
{
  "data": {
    "notifications": [ ],
    "unreadCount": 5
  }
}
```

---

### `PATCH /api/notifications/:id/read`

Mark a single notification as read. **Auth required.**

---

### `PATCH /api/notifications/read-all`

Mark all notifications as read. **Auth required.**

---

## Device Tokens

### `POST /api/device-tokens`

Register a push notification token. **Auth required.**

| Field | Type | Required |
|---|---|---|
| `token` | string | Yes |
| `platform` | string | No |

---

### `DELETE /api/device-tokens`

Unregister a push notification token. **Auth required.**

| Field | Type | Required |
|---|---|---|
| `token` | string | Yes |

---

## Area Status

### `GET /api/area-status`

Get safety status for a district area.

| Query Param | Type | Description |
|---|---|---|
| `district` | string | District name (returns global stats if empty) |

**Response:**
```json
{
  "data": {
    "level": "WASPADA",
    "levelColor": "#f59e0b",
    "levelBg": "#fffbeb",
    "hasWarning": true,
    "warningType": "Banjir",
    "warningMessage": "...",
    "activeReports": 12,
    "responseRate": 85,
    "avgResponseHours": 4.2,
    "isGlobal": false
  }
}
```

---

## Info Articles

### `GET /api/info`

List info and education articles.

| Query Param | Type | Default |
|---|---|---|
| `limit` | number | 10 |
| `category` | string | — |

---

### `GET /api/info/:id`

Get full article detail with content, tips, and related links.

---

## Activities

### `GET /api/activities`

Get the authenticated user's activity history. **Auth required.**

---

## File Upload

### `POST /api/upload`

Upload a file to Supabase Storage. **Auth required.** Uses `multipart/form-data`.

| Field | Type | Required |
|---|---|---|
| `file` | File | Yes |
| `bucket` | string | No |

**Response:**
```json
{
  "data": {
    "url": "https://project.supabase.co/storage/v1/object/public/..."
  }
}
```

---

## Feedback

### `POST /api/feedback`

Submit user feedback. **Auth required.**

| Field | Type | Required |
|---|---|---|
| `type` | string | Yes |
| `rating` | number | Yes |
| `title` | string | Yes |
| `message` | string | Yes |

---

## Bookmarks

### `POST /api/bookmarks`

Toggle bookmark on a report, action, or info article. **Auth required.**

| Field | Type | Required | Values |
|---|---|---|---|
| `refType` | string | Yes | `report`, `action`, `info` |
| `refId` | string | Yes | UUID of the target |

---

### `GET /api/bookmarks/check`

Check if a specific item is bookmarked. **Auth required.**

| Query Param | Type | Required |
|---|---|---|
| `refType` | string | Yes |
| `refId` | string | Yes |

---

## Admin

> [!IMPORTANT]
> All admin endpoints require the `admin` role. Protected by `requireRoles(['admin'])` middleware.

### `GET /api/admin/dashboard`

System-wide dashboard summary including user counts, report statistics, and key metrics. **Admin only.**

---

### `GET /api/admin/activity-log`

System-wide activity log with recent actions across all users. **Admin only.**

---

### `GET /api/admin/users`

List all users with role, status, and profile data. **Admin only.**

---

### `POST /api/admin/users`

Create a new user account with a specified role. **Admin only.**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | Email address |
| `password` | string | Yes | Initial password |
| `fullName` | string | Yes | Display name |
| `role` | string | Yes | `user`, `pemerintah`, or `admin` |

---

### `GET /api/admin/users/stats`

User statistics per role (total users, gov users, admins). **Admin only.**

---

### `GET /api/admin/analytics`

Aggregate analytics dashboard with system-wide metrics. **Admin only.**

---

### `PATCH /api/admin/users/:id/role`

Change a user's role. **Admin only.**

| Field | Type | Required | Values |
|---|---|---|---|
| `role` | string | Yes | `user`, `pemerintah`, `admin` |

---

### `PATCH /api/admin/users/:id/suspend`

Suspend or reactivate a user account. **Admin only.**

---

## BMKG

### `GET /api/bmkg/gempa-terkini`

Get the latest earthquake data from BMKG. No authentication required.

**Response:**
```json
{
  "success": true,
  "data": {
    "tanggal": "06 Mar 2026",
    "jam": "14:23:45 WIB",
    "magnitude": "5.2",
    "kedalaman": "10 km",
    "wilayah": "Pusat gempa berada di laut 45 km...",
    "lintang": "7.50 LS",
    "bujur": "110.45 BT",
    "shakemapUrl": "https://data.bmkg.go.id/DataMKG/TEWS/..."
  }
}
```

> [!TIP]
> The backend proxies the BMKG XML feed and converts it to JSON. If the BMKG API is unavailable, the endpoint returns `success: false` and the frontend gracefully hides the earthquake card.
