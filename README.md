# SIAGA — Sistem Informasi dan Aksi untuk Gerakan Aman

**SIAGA** is a civic technology mobile application that bridges the gap between citizens and local government to enable transparent, data-driven environmental and social issue reporting. Built for ProxoCoris 2026.

> **Competition**: ProxoCoris 2026

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Related Repositories](#related-repositories)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [Building the APK](#building-the-apk)
- [Project Structure](#project-structure)
- [Technical Documentation](#technical-documentation)
- [Team](#team)

---

## Overview

SIAGA empowers citizens (Warga) to report environmental and social issues in their area, track resolution progress via an interactive map, and participate in positive community actions. Government officials (Pemerintah) access a dedicated **Triage Cockpit** dashboard to manage reports in real-time, respond with verified resolution proofs, and monitor analytics. Super-admins manage users, roles, and system-wide moderation.

The platform integrates AI-powered assistance (Google Gemini), **Supabase Realtime** for live report updates, real-time earthquake alerts from BMKG, push notifications with radius-based targeting, and a gamified eco-points system to incentivize sustained community participation.

---

## Key Features

### Citizen (Warga)

| Feature | Description |
|---|---|
| Issue Reporting | Submit reports with photos, GPS location, and map-based pin placement |
| Interactive Map | View nearby reports on a Leaflet map with dynamic hotspot detection |
| AI Chat Assistant | Gemini AI-powered chatbot for disaster preparedness and safety education |
| Push Notifications | Radius-based alerts for nearby reports and status updates |
| Community Voting | Support and verify reports to increase urgency score |
| Positive Actions | Create and join community-driven environmental actions |
| Eco-Points | Gamified point system rewarding reporting, voting, and participation |
| SOS Emergency | Quick-dial access to national emergency services (112, 113, 110, etc.) |
| BMKG Earthquake Alerts | Real-time earthquake data with magnitude-based color coding |
| Search | Full-text search for reports across all categories and districts |

### Government (Pemerintah)

| Feature | Description |
|---|---|
| Triage Cockpit | Real-time severity-sorted report list with quick-action filters |
| Report Management | Filter, search, and update report statuses with role-aware actions |
| Resolution Proof | Submit resolution evidence with photos and notes (verified feedback) |
| Map Monitoring | Interactive map with report markers and hotspot analysis per district |
| Analytics Dashboard | Responsiveness score, category distribution, and activity timeline |
| Performance Profile | Response rate, resolution stats, and activity history |
| Supabase Realtime | Live subscription for instant report detail updates without refresh |

### Super-Admin

| Feature | Description |
|---|---|
| Admin Dashboard | System-wide statistics, user counts, and activity log |
| User Management | List all users, create accounts, modify roles, suspend/activate |
| Content Moderation | Review and moderate reported content |
| System Settings | Global application configuration |

---

## Tech Stack

### Frontend (this repository)

| Technology | Version | Purpose |
|---|---|---|
| React Native | 0.81.5 | Cross-platform mobile framework |
| Expo | 54 | Development toolchain and build service |
| TypeScript | 5.9 | Type-safe development |
| Expo Router | 6 | File-based routing and navigation |
| NativeWind | 4.2 | Tailwind CSS for React Native styling |
| Phosphor Icons | 3.0 | Consistent iconography |
| React Native Reanimated | 4.1 | Performant animations |
| React Native SVG | 15.15 | Vector graphics for analytics charts |
| Supabase JS | 2.98 | Realtime subscriptions and direct client access |
| Bottom Sheet | 5.2 | Gesture-driven bottom sheet component |

### Backend ([separate repository](https://github.com/orgs/StackHorizon-ProxoCoris/repositories))

| Technology | Version | Purpose |
|---|---|---|
| Express.js | 5 | REST API framework |
| TypeScript | 5.9 | Type-safe backend development |
| Supabase | 2.97 | PostgreSQL database and authentication |
| Google Gemini AI | 1.43 | AI chat assistant service |
| Expo Server SDK | 6.0 | Push notification delivery |

### External Services

| Service | Purpose |
|---|---|
| Supabase | Database (PostgreSQL), authentication, file storage, **Realtime** |
| Google Gemini | AI-powered chat for disaster/safety education |
| BMKG API | Real-time earthquake data for Indonesia |
| Expo Push | Native push notification delivery (Android/iOS) |

---

## Related Repositories

| Repository | Description |
|---|---|
| [Backend API](https://github.com/orgs/StackHorizon-ProxoCoris/repositories) | Express.js REST API server |
| **Frontend (this repo)** | React Native mobile application |

---

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Expo CLI**: `npm install -g expo-cli`
- **EAS CLI** (for builds): `npm install -g eas-cli`
- **Android Studio** with Android SDK (for emulator) or a physical Android device with Expo Go
- A running instance of the [Backend API](https://github.com/orgs/StackHorizon-ProxoCoris/repositories)

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/StackHorizon-ProxoCoris/<frontend-repo-name>.git
cd <frontend-repo-name>
```

2. Install dependencies:

```bash
npm install
```

3. Configure Supabase Realtime (required for live updates):

> [!IMPORTANT]
> The app uses `@supabase/supabase-js` for Realtime subscriptions on the report detail screen. The Supabase URL and anonymous key are configured in `services/supabase.ts`. Ensure your Supabase project has Realtime enabled for the `reports` table.

4. Configure the API endpoint (optional for development):

> [!NOTE]
> During development, the app automatically detects the backend IP from the Expo dev server. No manual configuration is required if the backend is running on port `3000` on the same machine.

For production builds, set the API URL in `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-production-api.com/api"
    }
  }
}
```

5. Clear Metro bundler cache (recommended after branch switching or major merges):

```bash
npx expo start -c
```

---

## Running the App

> [!IMPORTANT]
> Ensure the backend server is running before starting the app. The frontend requires an active API connection for all data-dependent features.

Start the Expo development server:

```bash
npx expo start
```

Then choose your target:

| Command | Target |
|---|---|
| `npx expo start --android` | Android emulator or device |
| `npx expo start --ios` | iOS simulator (macOS only) |
| Press `a` in terminal | Open on connected Android device |
| Scan QR code | Open in Expo Go on physical device |

---

## Building the APK

SIAGA uses [EAS Build](https://docs.expo.dev/build/introduction/) for generating production-ready application binaries.

1. Authenticate with Expo:

```bash
eas login
```

2. Build a preview APK (internal distribution):

```bash
eas build --platform android --profile preview
```

3. Build a production AAB (for Play Store):

```bash
eas build --platform android --profile production
```

> [!TIP]
> Use the `preview` profile for testing and competition submissions. It generates a directly installable `.apk` file. The `production` profile generates an `.aab` bundle intended for Google Play Store distribution.

---

## Project Structure

```
frontend-mobileapp/
├── app/                          # Screens (file-based routing)
│   ├── (tabs)/                   # Citizen tab screens
│   │   ├── index.tsx             #   Home — reports feed, area status, quick actions
│   │   ├── lapor.tsx             #   Report — create reports and positive actions
│   │   ├── pantau.tsx            #   Monitor — interactive map with bottom sheet
│   │   ├── aichat.tsx            #   AI Chat — Gemini-powered assistant
│   │   └── profil.tsx            #   Profile — user stats, eco-points, settings
│   ├── (gov-tabs)/               # Government tab screens
│   │   ├── index.tsx             #   Triage Cockpit — severity-sorted reports
│   │   ├── laporan.tsx           #   Report management — filter, search, update
│   │   ├── peta.tsx              #   Map monitoring — markers and hotspots
│   │   ├── analytics.tsx         #   Analytics — responsiveness, categories, timeline
│   │   └── profil-gov.tsx        #   Gov profile — performance and activity
│   ├── (admin-tabs)/             # Super-admin tab screens
│   │   ├── index.tsx             #   Admin dashboard — system-wide stats
│   │   ├── users.tsx             #   User management — list, create, roles
│   │   ├── moderation.tsx        #   Content moderation
│   │   ├── analytics.tsx         #   Analytics dashboard
│   │   ├── settings.tsx          #   System settings
│   │   └── profil-admin.tsx      #   Admin profile
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx             #   Login with password reset modal
│   │   └── register.tsx          #   Multi-step registration
│   ├── report-detail.tsx         # Report detail — vote, verify, comment, Realtime
│   ├── action-detail.tsx         # Action detail — join, leave, comment
│   ├── cari.tsx                  # Full-text search across reports
│   ├── info-detail.tsx           # Article detail view
│   ├── notifikasi.tsx            # Notification inbox
│   ├── edit-profil.tsx           # Edit citizen profile
│   ├── edit-profil-gov.tsx       # Edit gov profile with NIP/jabatan fields
│   ├── admin-user-detail.tsx     # Admin: detailed user view
│   ├── tambah-pengguna.tsx       # Admin: create new user
│   ├── moderasi-detail.tsx       # Admin: moderation detail
│   ├── semua-aksi.tsx            # Browse all positive actions
│   ├── semua-info.tsx            # Browse all info articles
│   ├── riwayat-aktivitas.tsx     # Activity history timeline
│   ├── pengaturan.tsx            # User settings
│   ├── pengaturan-sistem.tsx     # Admin: system settings
│   ├── ganti-password.tsx        # Change password
│   ├── akses-keamanan.tsx        # Security access settings
│   ├── bantuan.tsx               # Help center
│   ├── tentang.tsx               # About page
│   ├── feedback.tsx              # Submit feedback
│   └── _layout.tsx               # Root layout — auth guard, push notifications
├── components/
│   └── ui/                       # Reusable UI components
│       ├── MapPicker.tsx          #   Interactive map pin selector
│       ├── MapView.tsx            #   Leaflet map with report markers
│       ├── SOSButton.tsx          #   Floating SOS button with pulse animation
│       ├── SOSModal.tsx           #   Emergency contacts modal
│       ├── SectionHeader.tsx      #   Section header with action button
│       └── Toast.tsx              #   Toast notification system
├── services/                     # API service layer
│   ├── api.ts                    #   HTTP client with auto-detection and auth
│   ├── supabase.ts               #   Supabase client for Realtime subscriptions
│   ├── report.service.ts         #   Report CRUD, voting, statistics
│   ├── action.service.ts         #   Positive action CRUD, join/leave
│   ├── comment.service.ts        #   Comment operations
│   ├── notification.service.ts   #   Notification inbox management
│   ├── bmkg.service.ts           #   BMKG earthquake data
│   ├── area-status.service.ts    #   District-level area status
│   ├── admin.service.ts          #   Admin user management and analytics
│   ├── info.service.ts           #   Info articles and education content
│   └── activity.service.ts       #   User activity history
├── context/
│   └── auth.tsx                  # Authentication context and user state
├── contexts/
│   └── toast.context.tsx         # Global toast notification context
├── hooks/
│   ├── useCurrentLocation.ts     # GPS location hook with permissions
│   └── usePushNotifications.ts   # Push notification registration and handling
├── constants/
│   └── theme.ts                  # Color palette and design tokens
├── assets/                       # App icons, splash screen, static images
├── app.json                      # Expo configuration
├── eas.json                      # EAS Build profiles
├── tailwind.config.js            # NativeWind/Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

---

## Technical Documentation
### Technical Documentation

The primary documentation is written in English. You can also find the full set of documentation translated into **Bahasa Indonesia** in the [docs/id/](./docs/id/) directory.

| Document | English Version (Primary) | Indonesian Version |
|---|---|---|
| Architecture | [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | [ARCHITECTURE.md](./docs/id/ARCHITECTURE.md) |
| ERD | [ERD.md](./docs/ERD.md) | [ERD.md](./docs/id/ERD.md) |
| Data Structures | [DATA_STRUCTURES.md](./docs/DATA_STRUCTURES.md) | [DATA_STRUCTURES.md](./docs/id/DATA_STRUCTURES.md) |
| System Flow | [SYSTEM_FLOW.md](./docs/SYSTEM_FLOW.md) | [SYSTEM_FLOW.md](./docs/id/SYSTEM_FLOW.md) |
| API Documentation | [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) | [API_DOCUMENTATION.md](./docs/id/API_DOCUMENTATION.md) |


---

## Team

**Team StackHorizon** — Universitas Klabat

---

*Built with purpose for ProxoCoris 2026*
