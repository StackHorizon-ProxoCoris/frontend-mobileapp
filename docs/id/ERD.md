# Diagram Relasi Entitas

Dokumen ini menjelaskan skema database yang digunakan oleh SIAGA. Database di-host pada Supabase (PostgreSQL) dan dikelola melalui 14 file migrasi SQL sekuensial (migrasi 008 dihapus bersamaan dengan penghentian fitur Budget Watch).

---

## Diagram ER

```mermaid
erDiagram
    auth_users {
        UUID id PK
        VARCHAR email
        VARCHAR encrypted_password
        TIMESTAMPTZ created_at
    }

    users_metadata {
        UUID id PK
        UUID auth_id FK "UNIQUE → auth.users"
        VARCHAR full_name
        VARCHAR initials
        VARCHAR email
        VARCHAR phone
        TEXT bio
        VARCHAR district
        VARCHAR city
        VARCHAR province
        FLOAT lat
        FLOAT lng
        INTEGER eco_points
        VARCHAR current_badge
        INTEGER total_reports
        INTEGER total_actions
        INTEGER rank
        user_role_enum role "user | pemerintah | admin"
        TEXT nip "Khusus Pemerintah"
        TEXT jabatan "Khusus Pemerintah"
        TEXT instansi "Khusus Pemerintah"
        TEXT unit_kerja "Khusus Pemerintah"
        TEXT golongan "Khusus Pemerintah"
        TEXT tmt "Khusus Pemerintah"
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    reports {
        UUID id PK
        UUID user_id FK "→ auth.users"
        VARCHAR category
        VARCHAR type
        VARCHAR title
        TEXT description
        VARCHAR address
        VARCHAR district
        VARCHAR city
        FLOAT lat
        FLOAT lng
        VARCHAR status "Menunggu | Diverifikasi | Ditangani | Selesai"
        INTEGER urgency
        INTEGER votes_count
        INTEGER verified_count
        INTEGER photos_count
        INTEGER comments_count
        VARCHAR responded_by
        TIMESTAMPTZ estimated_completion
        TEXT_ARRAY photo_urls
        TEXT resolution_notes "Bukti resolusi pemerintah"
        TEXT resolution_image_url "Foto resolusi pemerintah"
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    actions {
        UUID id PK
        UUID user_id FK "→ auth.users"
        VARCHAR category
        VARCHAR type
        VARCHAR title
        TEXT description
        VARCHAR address
        VARCHAR district
        VARCHAR city
        FLOAT lat
        FLOAT lng
        VARCHAR status "Terjadwal | Berlangsung | Selesai"
        VARCHAR date
        VARCHAR duration
        INTEGER points
        INTEGER max_participants
        INTEGER total_participants
        BOOLEAN verified
        VARCHAR verified_by
        INTEGER comments_count
        TEXT_ARRAY photo_urls
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    comments {
        UUID id PK
        UUID user_id FK "→ auth.users"
        UUID target_id "Polimorfik"
        VARCHAR target_type "report | action"
        TEXT text
        INTEGER likes
        TIMESTAMPTZ created_at
    }

    report_votes {
        UUID id PK
        UUID user_id FK "→ auth.users"
        UUID report_id FK "→ reports"
        TIMESTAMPTZ created_at
    }

    report_verifications {
        UUID id PK
        UUID report_id FK "→ reports"
        UUID user_id
        TIMESTAMPTZ created_at
    }

    action_participants {
        UUID id PK
        UUID action_id FK "→ actions"
        UUID user_id
        TIMESTAMPTZ joined_at
    }

    bookmarks {
        UUID id PK
        UUID user_id
        VARCHAR ref_type "report | action | info"
        UUID ref_id "Polimorfik"
        TIMESTAMPTZ created_at
    }

    notifications {
        UUID id PK
        UUID user_id
        VARCHAR type
        VARCHAR title
        TEXT message
        VARCHAR ref_type
        VARCHAR ref_id
        BOOLEAN is_read
        TIMESTAMPTZ created_at
    }

    feedbacks {
        UUID id PK
        UUID user_id
        VARCHAR type "saran | bug | pujian | lainnya"
        INTEGER rating "1-5"
        VARCHAR title
        TEXT message
        TIMESTAMPTZ created_at
    }

    device_tokens {
        UUID id PK
        UUID user_id
        TEXT token "UNIQUE"
        VARCHAR platform "android | ios"
        BOOLEAN active
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ created_at
    }

    info_articles {
        UUID id PK
        VARCHAR type
        VARCHAR title
        TEXT subtitle
        VARCHAR category
        VARCHAR source
        VARCHAR color
        VARCHAR bg
        VARCHAR gradient
        JSONB content
        JSONB photo_urls
        JSONB tags
        JSONB tips
        JSONB related_links
        VARCHAR author_name
        VARCHAR author_initials
        VARCHAR author_role
        VARCHAR author_organization
        INTEGER stats_views
        INTEGER stats_shares
        INTEGER stats_bookmarks
        BOOLEAN verified
        VARCHAR verified_by
        VARCHAR read_time
        TIMESTAMPTZ published_at
        TIMESTAMPTZ updated_at
        TIMESTAMPTZ created_at
    }

    auth_users ||--|| users_metadata : "memiliki profil"
    auth_users ||--o{ reports : "membuat"
    auth_users ||--o{ actions : "membuat"
    auth_users ||--o{ comments : "menulis"
    auth_users ||--o{ report_votes : "mendukung"
    auth_users ||--o{ report_verifications : "memverifikasi"
    auth_users ||--o{ action_participants : "bergabung"
    auth_users ||--o{ bookmarks : "menyimpan"
    auth_users ||--o{ notifications : "menerima"
    auth_users ||--o{ feedbacks : "mengirim"
    auth_users ||--o{ device_tokens : "mendaftarkan"

    reports ||--o{ report_votes : "memiliki dukungan"
    reports ||--o{ report_verifications : "memiliki verifikasi"
    reports ||--o{ comments : "memiliki komentar"

    actions ||--o{ action_participants : "memiliki peserta"
    actions ||--o{ comments : "memiliki komentar"
```

---

## Deskripsi Tabel

### Tabel Inti

| Tabel | Deskripsi | RLS |
|---|---|---|
| `users_metadata` | Profil pengguna yang terhubung ke Supabase Auth via `auth_id`. Menyimpan lokasi, eco-points, badge gamifikasi, dan field khusus pemerintah (NIP, jabatan, instansi). Mendukung tiga peran: `user`, `pemerintah`, `admin`. | Ya |
| `reports` | Laporan masalah yang dibuat oleh warga. Berisi koordinat GPS, kategori, skor urgensi, alur status, URL foto, dan **field bukti resolusi** (`resolution_notes`, `resolution_image_url`) untuk verifikasi pemerintah. | Ya |
| `actions` | Aksi positif komunitas. Melacak peserta, poin, status verifikasi, dan foto sebelum/sesudah. | Ya |
| `comments` | Komentar polimorfik pada laporan dan aksi via `target_id` + `target_type`. | Ya |

### Tabel Relasi

| Tabel | Deskripsi | Constraint |
|---|---|---|
| `report_votes` | Melacak user mana yang mendukung laporan mana. | `UNIQUE(user_id, report_id)` |
| `report_verifications` | Melacak user mana yang memverifikasi laporan mana. | `UNIQUE(report_id, user_id)` |
| `action_participants` | Melacak user mana yang bergabung ke aksi mana. | `UNIQUE(action_id, user_id)` |
| `bookmarks` | Bookmark polimorfik untuk laporan, aksi, dan artikel info. | `UNIQUE(user_id, ref_type, ref_id)` |

### Tabel Sistem

| Tabel | Deskripsi |
|---|---|
| `notifications` | Inbox notifikasi in-app dengan status baca/belum baca. Mereferensi entitas sumber via `ref_type` dan `ref_id`. |
| `device_tokens` | Registri token push notification. Setiap perangkat mendaftarkan Expo push token-nya. Mendukung pembersihan otomatis token tidak valid. |
| `feedbacks` | Pengiriman feedback pengguna dengan klasifikasi tipe dan rating bintang 1-5. |

### Tabel Konten

| Tabel | Deskripsi |
|---|---|
| `info_articles` | Artikel edukasi dan informasi dengan konten JSONB yang kaya, metadata penulis, statistik, dan status verifikasi. |

### Fungsi

| Fungsi | Deskripsi |
|---|---|
| `increment_eco_points(p_user_id, p_amount)` | Fungsi PostgreSQL atomik untuk penambahan eco-points bebas race condition. Dipanggil via Supabase RPC. |
| `update_updated_at_column()` | Fungsi trigger yang otomatis memperbarui `updated_at` saat modifikasi baris. |

---

## Alur Status

### Status Laporan

```mermaid
stateDiagram-v2
    [*] --> Menunggu : Laporan dibuat
    Menunggu --> Diverifikasi : Verifikasi komunitas
    Diverifikasi --> Ditangani : Pemerintah merespons
    Ditangani --> Selesai : Pemerintah mengirim bukti resolusi
    Menunggu --> Ditangani : Respons langsung pemerintah
```

### Status Aksi

```mermaid
stateDiagram-v2
    [*] --> Terjadwal : Aksi dibuat
    Terjadwal --> Berlangsung : Kegiatan dimulai
    Berlangsung --> Selesai : Kegiatan selesai
```

---

## Indeks

Indeks kritis performa didefinisikan pada:

- **Lookup**: `auth_id`, `user_id`, `report_id`, `action_id`, `target_id`
- **Sorting**: `created_at DESC` pada semua tabel utama
- **Filtering**: `status`, `category`, `role`
- **Geospasial**: `(lat, lng)` pada reports untuk query terdekat
- **Notifikasi**: Partial index pada `(user_id, is_read) WHERE is_read = FALSE` untuk jumlah belum dibaca yang cepat

---

## Riwayat Migrasi

| # | File | Deskripsi |
|---|---|---|
| 001 | `create_users_metadata.sql` | Profil pengguna, RLS, trigger updated_at |
| 002 | `create_reports.sql` | Tabel laporan dengan indeks geospasial |
| 003 | `create_actions.sql` | Tabel aksi positif |
| 004 | `create_comments.sql` | Komentar polimorfik |
| 005 | `create_report_votes.sql` | Deduplikasi vote |
| 006 | `create_feedbacks.sql` | Feedback pengguna |
| 007 | `create_notifications.sql` | Inbox notifikasi |
| ~~008~~ | ~~`create_budget.sql`~~ | ~~Dihapus — Budget Watch dihentikan~~ |
| 009 | `add_user_role.sql` | Enum dan kolom role |
| 010 | `verify_join_bookmark.sql` | Verifikasi, partisipasi, bookmark |
| 011 | `info_articles.sql` | Artikel dengan data seed |
| 012 | `create_device_tokens.sql` | Registri push token |
| 013 | `increment_eco_points.sql` | Fungsi RPC increment atomik |
| 014 | `add_gov_profile_fields.sql` | Kolom profil khusus pemerintah |
| 015 | `add_report_resolution_proof.sql` | Kolom bukti resolusi pada reports |
