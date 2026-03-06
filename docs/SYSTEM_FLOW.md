# System Flow Diagrams

This document describes the core user journeys and process flows in SIAGA.

---

## 1. Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant App as Mobile App
    participant API as Backend
    participant Auth as Supabase Auth
    participant DB as PostgreSQL

    User->>App: Open app
    App->>App: Check SecureStore for JWT

    alt Token exists
        App->>API: GET /api/auth/me (Bearer token)
        API->>Auth: Verify JWT
        Auth-->>API: User identity
        API->>DB: Fetch users_metadata
        DB-->>API: User profile
        API-->>App: User data + role
        App->>App: Route to (tabs) or (gov-tabs)
    else No token
        App->>App: Show login screen
        User->>App: Enter credentials
        App->>API: POST /api/auth/login
        API->>Auth: signInWithPassword
        Auth-->>API: JWT token + refresh token
        API->>DB: Fetch users_metadata
        API-->>App: Token + user data
        App->>App: Store token in SecureStore
        App->>API: POST /api/device-tokens (push token)
        App->>App: Route based on role
    end
```

---

## 2. Report Creation Flow

```mermaid
sequenceDiagram
    participant Citizen as Citizen
    participant App as Mobile App
    participant GPS as GPS/MapPicker
    participant API as Backend
    participant DB as PostgreSQL
    participant Notif as Notification Service
    participant Push as Expo Push

    Citizen->>App: Tap "Lapor"
    App->>App: Select category + take photos
    Citizen->>App: Write title and description
    App->>GPS: Request location
    GPS-->>App: Coordinates (lat, lng)
    App->>App: Optional: adjust pin on MapPicker

    Citizen->>App: Submit report
    App->>API: POST /api/reports (multipart)
    API->>DB: Upload photos to Supabase Storage
    API->>DB: INSERT report with coordinates
    API->>DB: Update user eco_points (+10)

    API->>Notif: Trigger new report notification
    Notif->>DB: Find users within radius (Haversine)
    Notif->>DB: Find gov users in same district
    Notif->>DB: Bulk INSERT notifications
    Notif->>DB: Fetch device tokens
    Notif->>Push: Send push (fire-and-forget)
    Push-->>App: Native push to nearby users

    API-->>App: Report created successfully
    App-->>Citizen: Success feedback + navigate
```

---

## 3. Report Lifecycle

```mermaid
flowchart LR
    A["Citizen Creates Report"] --> B["Status: Menunggu"]
    B --> C{"Community Action"}

    C -->|"Vote / Support"| D["Urgency Score Increases"]
    D --> B
    C -->|"Verify"| E["Status: Diverifikasi"]
    C -->|"Comment"| F["Discussion Thread"]
    F --> B

    B -->|"Gov responds"| G["Status: Ditangani"]
    E -->|"Gov responds"| G
    G -->|"Issue resolved"| H["Status: Selesai"]

    D -.->|"Each vote"| N1["Notification to reporter"]
    E -.->|"Verification"| N2["Notification to reporter"]
    G -.->|"Status change"| N3["Notification to reporter + voters"]
    H -.->|"Resolved"| N4["Notification to all stakeholders"]

    style H fill:#059669,color:#fff
    style B fill:#f59e0b,color:#fff
    style G fill:#3b82f6,color:#fff
    style E fill:#8b5cf6,color:#fff
```

---

## 4. Push Notification Flow

```mermaid
flowchart TB
    subgraph Triggers["Event Triggers"]
        T1["New Report"]
        T2["Status Changed"]
        T3["New Vote"]
        T4["New Verification"]
        T5["New Comment"]
    end

    subgraph NotifService["Notification Service"]
        NS1["Determine recipients"]
        NS2["Radius-based targeting<br/>(Haversine formula)"]
        NS3["District-based targeting<br/>(Gov users)"]
        NS4["Direct targeting<br/>(Reporter, voters)"]
    end

    subgraph Delivery["Delivery"]
        D1["Bulk INSERT notifications"]
        D2["Lookup device_tokens"]
        D3["Expo Push Service"]
    end

    subgraph Client["Mobile Client"]
        C1["In-app notification badge"]
        C2["Native push alert"]
        C3["Deep link on tap"]
    end

    T1 & T2 & T3 & T4 & T5 --> NS1
    NS1 --> NS2 & NS3 & NS4
    NS2 & NS3 & NS4 --> D1
    D1 --> D2
    D2 --> D3
    D3 --> C2
    D1 --> C1
    C2 -->|"User taps"| C3
    C3 -->|"Navigate to"| ReportDetail["Report/Action Detail"]
```

---

## 5. AI Chat Flow

```mermaid
sequenceDiagram
    participant User
    participant App as Mobile App
    participant API as Backend
    participant AI as AI Service
    participant Gemini as Google Gemini

    User->>App: Open AI Chat tab
    App->>App: Show quick topic suggestions

    User->>App: Type message
    App->>API: POST /api/chat { message }
    API->>AI: processChat(message)
    AI->>Gemini: generateContent()
    Note over AI,Gemini: System instruction limits scope<br/>to disaster, safety, medical topics

    alt Success
        Gemini-->>AI: AI response text
        AI-->>API: Formatted response
        API-->>App: { reply: "..." }
        App-->>User: Display AI response
    else Gemini unavailable
        AI-->>API: Fallback response
        API-->>App: Generic safety info
        App-->>User: Graceful degradation message
    end
```

---

## 6. Government Dashboard Flow

```mermaid
flowchart TB
    subgraph GovDashboard["Government Dashboard"]
        GH["Dashboard Home"]
        GL["Laporan Management"]
        GP["Peta Monitoring"]
        GB["Budget Watch"]
        GPR["Profil Kinerja"]
    end

    subgraph Backend["Backend API"]
        A1["GET /api/reports/stats"]
        A2["GET /api/reports"]
        A3["PATCH /api/reports/:id/status"]
        A4["GET /api/budget/projects"]
        A5["GET /api/budget/dinas"]
    end

    GH -->|"Stats cards"| A1
    GH -->|"Recent reports"| A2
    GL -->|"Filter + search"| A2
    GL -->|"Update status"| A3
    GP -->|"Map markers"| A2
    GB -->|"Projects"| A4
    GB -->|"Dinas"| A5
    GPR -->|"Performance"| A1

    A3 -->|"Status changed"| Notif["Notification to reporter<br/>+ nearby citizens"]
```

---

## 7. Eco-Points Flow

```mermaid
flowchart LR
    subgraph Actions["Point-Earning Actions"]
        E1["+10 pts<br/>Create Report"]
        E2["+2 pts<br/>Vote/Support"]
        E3["+5 pts<br/>Verify Report"]
        E4["+2 pts<br/>Add Comment"]
        E5["+50 pts<br/>Create Action"]
    end

    subgraph Backend["Backend Processing"]
        RPC["increment_eco_points()<br/>Atomic PostgreSQL RPC"]
        Refresh["Frontend refreshUser()"]
    end

    subgraph Display["User-Facing"]
        Home["Home: Eco-Points Card"]
        Profile["Profile: Points + Badge"]
        Badge["Badge Progression<br/>Warga Baru → ..."]
    end

    E1 & E2 & E3 & E4 & E5 --> RPC
    RPC --> Refresh
    Refresh --> Home & Profile
    Profile --> Badge
```

---

## 8. BMKG Earthquake Integration

```mermaid
sequenceDiagram
    participant App as Mobile App
    participant API as Backend
    participant BMKG as BMKG API

    App->>API: GET /api/bmkg/gempa-terkini
    API->>BMKG: Fetch XML data
    BMKG-->>API: XML response

    alt Fetch successful
        API->>API: Parse XML to JSON (fast-xml-parser)
        API->>API: Extract gempa data fields
        API-->>App: { magnitude, wilayah, kedalaman, ... }
        App->>App: Show earthquake warning card
        App->>App: Load shakemap image
    else Fetch failed
        API-->>App: { success: false }
        App->>App: Card hidden (graceful degradation)
    end
```
