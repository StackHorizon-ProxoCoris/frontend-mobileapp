# SIAGA — Sistem Informasi dan Aksi untuk Gerakan Aman

**SIAGA** is a civic technology mobile application that bridges the gap between citizens and local government to enable transparent, data-driven environmental and social issue reporting. Built for the Smart, Inclusive, and Sustainable Cities sub-theme of BCC 2026.

> **Competition Theme**: Bridging Gaps: Code for Earth, Intelligence for Justice, and Sustainability for Shaping Tomorrow
>
> **Sub-theme**: Smart, Inclusive, and Sustainable Cities

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

SIAGA empowers citizens (Warga) to report environmental and social issues in their area, track resolution progress via an interactive map, and participate in positive community actions. Government officials (Pemerintah) access a dedicated dashboard to manage reports, monitor budget transparency, and track performance metrics.

The platform integrates AI-powered assistance (Google Gemini), real-time earthquake alerts from BMKG, push notifications with radius-based targeting, and a gamified eco-points system to incentivize sustained community participation.

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
| BMKG Earthquake Alerts | Real-time earthquake data with shakemap visualization |

### Government (Pemerintah)

| Feature | Description |
|---|---|
| Dashboard | Live statistics, pending reports, and quick action overview |
| Report Management | Filter, search, and update report statuses |
| Map Monitoring | Interactive map with report markers and hotspot analysis per district |
| Budget Transparency | APBD tracking, budget absorption rates, and anomaly detection |
| Performance Profile | Response rate, resolution stats, and activity history |

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
| Supabase | Database (PostgreSQL), authentication, file storage |
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

3. Configure the API endpoint (optional for development):

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
│   │   ├── index.tsx             #   Dashboard — live stats and recent reports
│   │   ├── laporan.tsx           #   Report management — filter, search, status update
│   │   ├── peta.tsx              #   Map monitoring — markers and hotspots
│   │   ├── budget.tsx            #   Budget watch — APBD and absorption tracking
│   │   └── profil-gov.tsx        #   Gov profile — performance and activity
│   ├── (admin-tabs)/             # Admin tab screens (post-MVP)
│   ├── (auth)/                   # Authentication screens
│   │   ├── login.tsx             #   Login with password reset modal
│   │   └── register.tsx          #   Multi-step registration
│   ├── report-detail.tsx         # Report detail — vote, verify, comment, map
│   ├── action-detail.tsx         # Action detail — join, leave, comment
│   ├── info-detail.tsx           # Article detail view
│   ├── notifikasi.tsx            # Notification inbox
│   ├── edit-profil.tsx           # Edit profile form
│   ├── pengaturan.tsx            # User settings
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
│   ├── report.service.ts         #   Report CRUD, voting, statistics
│   ├── action.service.ts         #   Positive action CRUD, join/leave
│   ├── comment.service.ts        #   Comment operations
│   ├── notification.service.ts   #   Notification inbox management
│   ├── bmkg.service.ts           #   BMKG earthquake data
│   ├── area-status.service.ts    #   District-level area status
│   ├── budget.service.ts         #   Budget and APBD data
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

Detailed technical documentation is available in the [`docs/`](./docs/) directory:

| Document | Description |
|---|---|
| [Architecture](./docs/ARCHITECTURE.md) | System architecture diagram and layer descriptions |
| [ERD](./docs/ERD.md) | Entity Relationship Diagram and data model |
| [System Flow](./docs/SYSTEM_FLOW.md) | Core user journey and process flow diagrams |
| [API Documentation](./docs/API_DOCUMENTATION.md) | Complete REST API endpoint reference |

---

## Team

**Team StackHorizon** — Telkom University

---

*Built with purpose for BCC 2026 — Bridging Gaps: Code for Earth, Intelligence for Justice, and Sustainability for Shaping Tomorrow*
