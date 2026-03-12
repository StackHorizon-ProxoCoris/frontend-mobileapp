# Dokumentasi API

Referensi lengkap REST API untuk Backend SIAGA. Semua endpoint diawali dengan `/api`.

URL Dasar: `http://localhost:3000/api` (development)

---

## Daftar Isi

- [Autentikasi](#autentikasi)
- [Format Respons](#format-respons)
- [Health Check](#health-check)
- [Auth](#auth)
- [Laporan](#laporan)
- [Aksi Positif](#aksi-positif)
- [Komentar](#komentar)
- [AI Chat](#ai-chat)
- [Notifikasi](#notifikasi)
- [Device Token](#device-token)
- [Status Area](#status-area)
- [Artikel Info](#artikel-info)
- [Aktivitas](#aktivitas)
- [Upload File](#upload-file)
- [Feedback](#feedback)
- [Bookmark](#bookmark)
- [Admin](#admin)
- [BMKG](#bmkg)

---

## Autentikasi

Semua endpoint terautentikasi memerlukan Bearer token di header `Authorization`:

```
Authorization: Bearer <jwt_token>
```

Token diterbitkan oleh Supabase Auth saat login dan diverifikasi oleh `authMiddleware` backend.

---

## Format Respons

Semua endpoint mengembalikan struktur JSON yang konsisten:

```json
{
  "success": true,
  "message": "Operasi berhasil dilakukan",
  "data": { },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

Respons error:

```json
{
  "success": false,
  "message": "Deskripsi error",
  "error": "Informasi error detail"
}
```

---

## Health Check

### `GET /api/health`

Endpoint pemeriksaan kesehatan server. Tidak memerlukan autentikasi.

**Respons:**
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

Mendaftarkan akun pengguna baru.

| Field | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `email` | string | Ya | Alamat email valid |
| `password` | string | Ya | Minimal 6 karakter |
| `fullName` | string | Ya | Nama tampilan |
| `phone` | string | Tidak | Nomor telepon |
| `district` | string | Tidak | Kecamatan |
| `city` | string | Tidak | Kota |
| `province` | string | Tidak | Provinsi |
| `role` | string | Tidak | `user` (default) atau `pemerintah` |

**Respons:** `201 Created` — Mengembalikan token JWT dan profil pengguna.

---

### `POST /api/auth/login`

Autentikasi dan menerima token JWT.

| Field | Tipe | Wajib |
|---|---|---|
| `email` | string | Ya |
| `password` | string | Ya |

**Respons:**
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

Mendapatkan profil pengguna terautentikasi. **Autentikasi diperlukan.**

---

### `PATCH /api/auth/profile`

Memperbarui field profil pengguna. **Autentikasi diperlukan.**

| Field | Tipe | Deskripsi |
|---|---|---|
| `fullName` | string | Nama tampilan |
| `phone` | string | Nomor telepon |
| `bio` | string | Biografi |
| `district` | string | Kecamatan |
| `city` | string | Kota |
| `province` | string | Provinsi |
| `nip` | string | Pemerintah: NIP |
| `jabatan` | string | Pemerintah: jabatan |
| `instansi` | string | Pemerintah: nama instansi |

---

### `PATCH /api/auth/settings`

Memperbarui pengaturan pengguna. **Autentikasi diperlukan.**

---

### `POST /api/auth/change-password`

Mengubah password pengguna terautentikasi. **Autentikasi diperlukan.**

| Field | Tipe | Wajib |
|---|---|---|
| `currentPassword` | string | Ya |
| `newPassword` | string | Ya |

---

### `POST /api/auth/logout`

Logout dan invalidasi sesi. **Autentikasi diperlukan.**

---

### `POST /api/auth/forgot-password`

Mengirim email reset password via Supabase.

| Field | Tipe | Wajib |
|---|---|---|
| `email` | string | Ya |

---

## Laporan

### `GET /api/reports`

Daftar laporan dengan filter dan paginasi opsional. Autentikasi opsional (menyediakan flag `hasVoted` jika terautentikasi).

| Query Param | Tipe | Default | Deskripsi |
|---|---|---|---|
| `page` | number | 1 | Nomor halaman |
| `limit` | number | 10 | Item per halaman |
| `status` | string | — | Filter berdasarkan status |
| `category` | string | — | Filter berdasarkan kategori |
| `district` | string | — | Filter berdasarkan kecamatan |
| `search` | string | — | Pencarian di judul/deskripsi |

---

### `GET /api/reports/stats`

Statistik laporan agregat untuk tampilan dasbor.

**Respons:**
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

Mendapatkan laporan di dekat koordinat geografis.

| Query Param | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `lat` | number | Ya | Latitude |
| `lng` | number | Ya | Longitude |
| `radius` | number | Tidak | Radius dalam km (default: 5) |

---

### `GET /api/reports/map-markers`

Data laporan ringan yang dioptimalkan untuk rendering marker peta.

---

### `GET /api/reports/:id`

Detail laporan lengkap termasuk field bukti resolusi. Autentikasi opsional (menyediakan flag `hasVoted`, `hasVerified`).

**Respons termasuk:**
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

Membuat laporan baru. **Autentikasi diperlukan.**

| Field | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `category` | string | Ya | Kategori laporan |
| `title` | string | Ya | Judul laporan |
| `description` | string | Ya | Deskripsi detail |
| `address` | string | Ya | Alamat lokasi |
| `lat` | number | Ya | Koordinat latitude |
| `lng` | number | Ya | Koordinat longitude |
| `district` | string | Tidak | Nama kecamatan |
| `photo_urls` | string[] | Tidak | Array URL foto |

Memicu: `+10 eco-points`, notifikasi ke pengguna terdekat dan pemerintah.

---

### `POST /api/reports/:id/vote`

Toggle vote/dukungan pada laporan. **Autentikasi diperlukan.**

**Respons:**
```json
{
  "data": {
    "voted": true,
    "votesCount": 15,
    "urgency": 42
  }
}
```

Memicu: `+2 eco-points` (pada vote pertama), notifikasi ke pelapor.

---

### `POST /api/reports/:id/verify`

Verifikasi keabsahan laporan. **Autentikasi diperlukan.**

Memicu: `+5 eco-points`, notifikasi ke pelapor.

---

### `PATCH /api/reports/:id/status`

Memperbarui status laporan. **Autentikasi diperlukan. Khusus role pemerintah/admin.**

| Field | Tipe | Wajib | Nilai |
|---|---|---|---|
| `status` | string | Ya | `Diverifikasi`, `Ditangani`, `Selesai` |
| `resolution_notes` | string | Tidak | Catatan bukti resolusi (saat set `Selesai`) |
| `resolution_image_url` | string | Tidak | URL foto bukti resolusi |

Memicu: notifikasi ke pelapor dan pendukung. Update Supabase Realtime.

---

### `PATCH /api/reports/:id/resolve-by-user`

Mengizinkan pelapor menutup laporannya sendiri. **Autentikasi diperlukan.**

---

## Aksi Positif

### `GET /api/actions`

Daftar aksi positif dengan paginasi.

| Query Param | Tipe | Default |
|---|---|---|
| `page` | number | 1 |
| `limit` | number | 10 |

---

### `GET /api/actions/:id`

Detail aksi lengkap termasuk daftar peserta.

---

### `POST /api/actions`

Membuat aksi positif baru. **Autentikasi diperlukan.**

| Field | Tipe | Wajib |
|---|---|---|
| `category` | string | Ya |
| `title` | string | Ya |
| `description` | string | Ya |
| `address` | string | Ya |
| `lat` | number | Tidak |
| `lng` | number | Tidak |
| `date` | string | Tidak |
| `duration` | string | Tidak |

Memicu: `+50 eco-points`.

---

### `POST /api/actions/:id/join`

Bergabung ke aksi positif. **Autentikasi diperlukan.**

---

### `DELETE /api/actions/:id/join`

Keluar dari aksi positif. **Autentikasi diperlukan.**

---

## Komentar

### `GET /api/comments/:targetType/:targetId`

Mendapatkan komentar untuk laporan atau aksi.

| URL Param | Tipe | Nilai |
|---|---|---|
| `targetType` | string | `report` atau `action` |
| `targetId` | string | UUID dari target |

---

### `POST /api/comments`

Menambah komentar. **Autentikasi diperlukan.**

| Field | Tipe | Wajib |
|---|---|---|
| `targetId` | string | Ya |
| `targetType` | string | Ya |
| `text` | string | Ya |

Memicu: `+2 eco-points`, notifikasi ke pemilik laporan/aksi.

---

## AI Chat

### `POST /api/chat`

Mengirim pesan ke asisten AI Gemini. **Autentikasi diperlukan.**

| Field | Tipe | Wajib |
|---|---|---|
| `message` | string | Ya |

**Respons:**
```json
{
  "success": true,
  "data": {
    "reply": "Teks respons AI..."
  }
}
```

> [!NOTE]
> Asisten AI dibatasi pada topik kesiapsiagaan bencana, keselamatan, dan medis melalui instruksi sistem. Pertanyaan di luar topik menerima pengalihan yang sopan.

---

## Notifikasi

### `GET /api/notifications`

Mendapatkan inbox notifikasi pengguna terautentikasi. **Autentikasi diperlukan.**

**Respons termasuk:**
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

Menandai satu notifikasi sebagai dibaca. **Autentikasi diperlukan.**

---

### `PATCH /api/notifications/read-all`

Menandai semua notifikasi sebagai dibaca. **Autentikasi diperlukan.**

---

## Device Token

### `POST /api/device-tokens`

Mendaftarkan token push notification. **Autentikasi diperlukan.**

| Field | Tipe | Wajib |
|---|---|---|
| `token` | string | Ya |
| `platform` | string | Tidak |

---

### `DELETE /api/device-tokens`

Membatalkan registrasi token push notification. **Autentikasi diperlukan.**

| Field | Tipe | Wajib |
|---|---|---|
| `token` | string | Ya |

---

## Status Area

### `GET /api/area-status`

Mendapatkan status keamanan untuk area kecamatan.

| Query Param | Tipe | Deskripsi |
|---|---|---|
| `district` | string | Nama kecamatan (mengembalikan statistik global jika kosong) |

**Respons:**
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

## Artikel Info

### `GET /api/info`

Daftar artikel info dan edukasi.

| Query Param | Tipe | Default |
|---|---|---|
| `limit` | number | 10 |
| `category` | string | — |

---

### `GET /api/info/:id`

Detail artikel lengkap dengan konten, tips, dan link terkait.

---

## Aktivitas

### `GET /api/activities`

Mendapatkan riwayat aktivitas pengguna terautentikasi. **Autentikasi diperlukan.**

---

## Upload File

### `POST /api/upload`

Upload file ke Supabase Storage. **Autentikasi diperlukan.** Menggunakan `multipart/form-data`.

| Field | Tipe | Wajib |
|---|---|---|
| `file` | File | Ya |
| `bucket` | string | Tidak |

**Respons:**
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

Mengirim feedback pengguna. **Autentikasi diperlukan.**

| Field | Tipe | Wajib |
|---|---|---|
| `type` | string | Ya |
| `rating` | number | Ya |
| `title` | string | Ya |
| `message` | string | Ya |

---

## Bookmark

### `POST /api/bookmarks`

Toggle bookmark pada laporan, aksi, atau artikel info. **Autentikasi diperlukan.**

| Field | Tipe | Wajib | Nilai |
|---|---|---|---|
| `refType` | string | Ya | `report`, `action`, `info` |
| `refId` | string | Ya | UUID dari target |

---

### `GET /api/bookmarks/check`

Memeriksa apakah item tertentu sudah di-bookmark. **Autentikasi diperlukan.**

| Query Param | Tipe | Wajib |
|---|---|---|
| `refType` | string | Ya |
| `refId` | string | Ya |

---

## Admin

> [!IMPORTANT]
> Semua endpoint admin memerlukan role `admin`. Dilindungi oleh middleware `requireRoles(['admin'])`.

### `GET /api/admin/dashboard`

Ringkasan dasbor seluruh sistem termasuk jumlah pengguna, statistik laporan, dan metrik utama. **Khusus admin.**

---

### `GET /api/admin/activity-log`

Log aktivitas seluruh sistem dengan aksi terbaru dari semua pengguna. **Khusus admin.**

---

### `GET /api/admin/users`

Daftar semua pengguna dengan role, status, dan data profil. **Khusus admin.**

---

### `POST /api/admin/users`

Membuat akun pengguna baru dengan role tertentu. **Khusus admin.**

| Field | Tipe | Wajib | Deskripsi |
|---|---|---|---|
| `email` | string | Ya | Alamat email |
| `password` | string | Ya | Password awal |
| `fullName` | string | Ya | Nama tampilan |
| `role` | string | Ya | `user`, `pemerintah`, atau `admin` |

---

### `GET /api/admin/users/stats`

Statistik pengguna per role (total user, user pemerintah, admin). **Khusus admin.**

---

### `GET /api/admin/analytics`

Dasbor analitik agregat dengan metrik seluruh sistem. **Khusus admin.**

---

### `PATCH /api/admin/users/:id/role`

Mengubah role pengguna. **Khusus admin.**

| Field | Tipe | Wajib | Nilai |
|---|---|---|---|
| `role` | string | Ya | `user`, `pemerintah`, `admin` |

---

### `PATCH /api/admin/users/:id/suspend`

Suspend atau mengaktifkan kembali akun pengguna. **Khusus admin.**

---

## BMKG

### `GET /api/bmkg/gempa-terkini`

Mendapatkan data gempa terbaru dari BMKG. Tidak memerlukan autentikasi.

**Respons:**
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
> Backend mem-proxy feed XML BMKG dan mengonversinya ke JSON. Jika API BMKG tidak tersedia, endpoint mengembalikan `success: false` dan frontend menyembunyikan kartu gempa secara halus.
