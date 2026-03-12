# Diagram Alur Sistem

Dokumen ini menjelaskan perjalanan pengguna utama dan alur proses dalam SIAGA.

---

## 1. Alur Autentikasi

```mermaid
sequenceDiagram
    participant User as Pengguna
    participant App as Aplikasi Mobile
    participant API as Backend
    participant Auth as Supabase Auth
    participant DB as PostgreSQL

    User->>App: Buka aplikasi
    App->>App: Cek SecureStore untuk JWT

    alt Token ada
        App->>API: GET /api/auth/me (Bearer token)
        API->>Auth: Verifikasi JWT
        Auth-->>API: Identitas pengguna
        API->>DB: Ambil users_metadata
        DB-->>API: Profil pengguna
        API-->>App: Data user + role
        App->>App: Arahkan ke (tabs) atau (gov-tabs) atau (admin-tabs)
    else Tidak ada token
        App->>App: Tampilkan layar login
        User->>App: Masukkan kredensial
        App->>API: POST /api/auth/login
        API->>Auth: signInWithPassword
        Auth-->>API: Token JWT + refresh token
        API->>DB: Ambil users_metadata
        API-->>App: Token + data user
        App->>App: Simpan token di SecureStore
        App->>API: POST /api/device-tokens (push token)
        App->>App: Arahkan berdasarkan role
    end
```

---

## 2. Alur Pembuatan Laporan

```mermaid
sequenceDiagram
    participant Citizen as Warga
    participant App as Aplikasi Mobile
    participant GPS as GPS/MapPicker
    participant API as Backend
    participant DB as PostgreSQL
    participant Notif as Layanan Notifikasi
    participant Push as Expo Push

    Citizen->>App: Ketuk "Lapor"
    App->>App: Pilih kategori + ambil foto
    Citizen->>App: Tulis judul dan deskripsi
    App->>GPS: Minta lokasi
    GPS-->>App: Koordinat (lat, lng)
    App->>App: Opsional: sesuaikan pin di MapPicker

    Citizen->>App: Kirim laporan
    App->>API: POST /api/reports (multipart)
    API->>DB: Upload foto ke Supabase Storage
    API->>DB: INSERT laporan dengan koordinat
    API->>DB: Update eco_points pengguna (+10)

    API->>Notif: Trigger notifikasi laporan baru
    Notif->>DB: Cari pengguna dalam radius (Haversine)
    Notif->>DB: Cari petugas pemerintah di kecamatan yang sama
    Notif->>DB: Bulk INSERT notifikasi
    Notif->>DB: Ambil device token
    Notif->>Push: Kirim push (fire-and-forget)
    Push-->>App: Push native ke pengguna terdekat

    API-->>App: Laporan berhasil dibuat
    App-->>Citizen: Feedback sukses + navigasi
```

---

## 3. Siklus Hidup Laporan

```mermaid
flowchart LR
    A["Warga Membuat Laporan"] --> B["Status: Menunggu"]
    B --> C{"Aksi Komunitas"}

    C -->|"Vote / Dukung"| D["Skor Urgensi Naik"]
    D --> B
    C -->|"Verifikasi"| E["Status: Diverifikasi"]
    C -->|"Komentar"| F["Thread Diskusi"]
    F --> B

    B -->|"Pemerintah merespons"| G["Status: Ditangani"]
    E -->|"Pemerintah merespons"| G
    G -->|"Pemerintah kirim bukti"| H["Status: Selesai"]

    D -.->|"Setiap vote"| N1["Notifikasi ke pelapor"]
    E -.->|"Verifikasi"| N2["Notifikasi ke pelapor"]
    G -.->|"Status berubah"| N3["Notifikasi ke pelapor + pendukung"]
    H -.->|"Selesai + bukti"| N4["Notifikasi ke semua pihak"]

    style H fill:#059669,color:#fff
    style B fill:#f59e0b,color:#fff
    style G fill:#3b82f6,color:#fff
    style E fill:#8b5cf6,color:#fff
```

---

## 4. Alur Bukti Resolusi Pemerintah

```mermaid
sequenceDiagram
    participant Gov as Pejabat Pemerintah
    participant App as Aplikasi Mobile
    participant API as Backend
    participant DB as PostgreSQL
    participant Storage as Supabase Storage
    participant RT as Supabase Realtime

    Gov->>App: Buka detail laporan
    App->>API: GET /api/reports/:id
    API-->>App: Data laporan

    Gov->>App: Ketuk "Tandai Selesai"
    App->>App: Buka modal bukti resolusi
    Gov->>App: Tulis catatan resolusi
    Gov->>App: Lampirkan foto resolusi

    Gov->>App: Kirim resolusi
    App->>API: PATCH /api/reports/:id/status
    Note over App,API: body: status, resolution_notes, resolution_image_url
    API->>Storage: Upload foto resolusi
    API->>DB: UPDATE status laporan + bukti
    API->>DB: Trigger notifikasi

    DB-->>RT: Event perubahan baris
    RT-->>App: Update realtime
    App->>App: UI refresh otomatis (tanpa reload manual)

    API-->>App: Sukses + laporan terupdate
    App-->>Gov: Badge terverifikasi ditampilkan
```

---

## 5. Alur Push Notification

```mermaid
flowchart TB
    subgraph Triggers["Pemicu Event"]
        T1["Laporan Baru"]
        T2["Status Berubah"]
        T3["Vote Baru"]
        T4["Verifikasi Baru"]
        T5["Komentar Baru"]
    end

    subgraph NotifService["Layanan Notifikasi"]
        NS1["Tentukan penerima"]
        NS2["Penargetan berbasis radius<br/>(rumus Haversine)"]
        NS3["Penargetan berbasis kecamatan<br/>(pengguna pemerintah)"]
        NS4["Penargetan langsung<br/>(pelapor, pendukung)"]
    end

    subgraph Delivery["Pengiriman"]
        D1["Bulk INSERT notifikasi"]
        D2["Lookup device_tokens"]
        D3["Expo Push Service"]
    end

    subgraph Client["Klien Mobile"]
        C1["Badge notifikasi in-app"]
        C2["Alert push native"]
        C3["Deep link saat diketuk"]
    end

    T1 & T2 & T3 & T4 & T5 --> NS1
    NS1 --> NS2 & NS3 & NS4
    NS2 & NS3 & NS4 --> D1
    D1 --> D2
    D2 --> D3
    D3 --> C2
    D1 --> C1
    C2 -->|"Pengguna mengetuk"| C3
    C3 -->|"Navigasi ke"| ReportDetail["Detail Laporan/Aksi"]
```

---

## 6. Alur AI Chat

```mermaid
sequenceDiagram
    participant User as Pengguna
    participant App as Aplikasi Mobile
    participant API as Backend
    participant AI as Layanan AI
    participant Gemini as Google Gemini

    User->>App: Buka tab AI Chat
    App->>App: Tampilkan saran topik cepat

    User->>App: Ketik pesan
    App->>API: POST /api/chat { message }
    API->>AI: processChat(message)
    AI->>Gemini: generateContent()
    Note over AI,Gemini: Instruksi sistem membatasi cakupan<br/>ke topik bencana, keselamatan, medis

    alt Berhasil
        Gemini-->>AI: Teks respons AI
        AI-->>API: Respons terformat
        API-->>App: { reply: "..." }
        App-->>User: Tampilkan respons AI
    else Gemini tidak tersedia
        AI-->>API: Respons fallback
        API-->>App: Info keselamatan generik
        App-->>User: Pesan degradasi yang halus
    end
```

---

## 7. Alur Dasbor Pemerintah

```mermaid
flowchart TB
    subgraph GovDashboard["Dasbor Pemerintah"]
        GH["Triage Cockpit"]
        GL["Manajemen Laporan"]
        GP["Pemantauan Peta"]
        GA["Analitik"]
        GPR["Profil Kinerja"]
    end

    subgraph Backend["Backend API"]
        A1["GET /api/reports/stats"]
        A2["GET /api/reports"]
        A3["PATCH /api/reports/:id/status"]
    end

    GH -->|"Kartu statistik"| A1
    GH -->|"Laporan diurutkan berdasarkan urgensi"| A2
    GL -->|"Filter + pencarian"| A2
    GL -->|"Update status + bukti"| A3
    GP -->|"Marker peta"| A2
    GA -->|"Data analitik"| A1
    GPR -->|"Kinerja"| A1

    A3 -->|"Status berubah"| Notif["Notifikasi ke pelapor<br/>+ warga terdekat"]
```

---

## 8. Alur Dasbor Admin

```mermaid
flowchart TB
    subgraph AdminDashboard["Dasbor Super-Admin"]
        AD["Beranda Dasbor"]
        AU["Manajemen Pengguna"]
        AM["Moderasi Konten"]
        AA["Analitik"]
        AS["Pengaturan Sistem"]
    end

    subgraph Backend["Backend API"]
        B1["GET /api/admin/dashboard"]
        B2["GET /api/admin/users"]
        B3["POST /api/admin/users"]
        B4["PATCH /api/admin/users/:id/role"]
        B5["PATCH /api/admin/users/:id/suspend"]
        B6["GET /api/admin/analytics"]
        B7["GET /api/admin/activity-log"]
    end

    AD -->|"Statistik sistem"| B1
    AD -->|"Log aktivitas"| B7
    AU -->|"Daftar pengguna"| B2
    AU -->|"Buat pengguna"| B3
    AU -->|"Ubah role"| B4
    AU -->|"Suspend/aktifkan"| B5
    AA -->|"Data agregat"| B6
```

---

## 9. Alur Eco-Points

```mermaid
flowchart LR
    subgraph Actions["Aksi Penghasil Poin"]
        E1["+10 poin<br/>Buat Laporan"]
        E2["+2 poin<br/>Vote/Dukungan"]
        E3["+5 poin<br/>Verifikasi Laporan"]
        E4["+2 poin<br/>Tambah Komentar"]
        E5["+50 poin<br/>Buat Aksi"]
    end

    subgraph Backend["Pemrosesan Backend"]
        RPC["increment_eco_points()<br/>RPC PostgreSQL Atomik"]
        Refresh["Frontend refreshUser()"]
    end

    subgraph Display["Tampilan Pengguna"]
        Home["Beranda: Kartu Eco-Points"]
        Profile["Profil: Poin + Badge"]
        Badge["Progresi Badge<br/>Warga Baru → ..."]
    end

    E1 & E2 & E3 & E4 & E5 --> RPC
    RPC --> Refresh
    Refresh --> Home & Profile
    Profile --> Badge
```

---

## 10. Integrasi Gempa BMKG

```mermaid
sequenceDiagram
    participant App as Aplikasi Mobile
    participant API as Backend
    participant BMKG as API BMKG

    App->>API: GET /api/bmkg/gempa-terkini
    API->>BMKG: Ambil data XML
    BMKG-->>API: Respons XML

    alt Pengambilan berhasil
        API->>API: Parse XML ke JSON (fast-xml-parser)
        API->>API: Ekstrak field data gempa
        API-->>App: { magnitude, wilayah, kedalaman, ... }
        App->>App: Tampilkan kartu peringatan gempa
        App->>App: Kode warna berdasarkan tingkat magnitudo
        App->>App: Muat gambar shakemap
    else Pengambilan gagal
        API-->>App: { success: false }
        App->>App: Kartu disembunyikan (degradasi halus)
    end
```
