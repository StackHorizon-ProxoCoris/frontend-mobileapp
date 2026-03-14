# SIAGA — Sistem Informasi dan Aksi untuk Gerakan Aman

**SIAGA** adalah aplikasi mobile civic technology yang menjembatani kesenjangan antara warga dan pemerintah daerah untuk memungkinkan pelaporan masalah lingkungan dan sosial yang transparan dan didorong oleh data. Dibangun untuk ProxoCoris 2026.

> **Kompetisi**: ProxoCoris 2026

---

## Daftar Isi

- [Ikhtisar](#ikhtisar)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Repositori Terkait](#repositori-terkait)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Membangun APK](#membangun-apk)
- [Struktur Proyek](#struktur-proyek)
- [Dokumentasi Teknis](#dokumentasi-teknis)
- [Tim](#tim)

---

## Ikhtisar

SIAGA memberdayakan warga (Warga) untuk melaporkan masalah lingkungan dan sosial di area mereka, melacak kemajuan resolusi melalui peta interaktif, dan berpartisipasi dalam aksi komunitas yang positif. Pejabat pemerintah (Pemerintah) mengakses dasbor **Triage Cockpit** khusus untuk mengelola laporan secara real-time, merespons dengan bukti resolusi yang terverifikasi, dan memantau analitik. Super-admin mengelola pengguna, peran, dan moderasi tingkat sistem.

Platform ini mengintegrasikan bantuan bertenaga AI (Google Gemini), **Supabase Realtime** untuk pembaruan laporan langsung, peringatan gempa real-time dari BMKG, notifikasi push dengan penargetan berbasis radius, dan sistem gamifikasi eco-points untuk mendorong partisipasi komunitas yang berkelanjutan.

---

## Fitur Utama

### Warga

| Fitur | Deskripsi |
|---|---|
| Pelaporan Masalah | Kirim laporan dengan foto, lokasi GPS, dan penempatan pin berbasis peta |
| Peta Interaktif | Lihat laporan terdekat pada peta Leaflet dengan deteksi hotspot dinamis |
| Asisten Chat AI | Chatbot bertenaga Gemini AI untuk kesiapsiagaan bencana dan edukasi keselamatan |
| Notifikasi Push | Peringatan berbasis radius untuk laporan terdekat dan pembaruan status |
| Dukungan Komunitas | Dukung dan verifikasi laporan untuk meningkatkan skor urgensi |
| Aksi Positif | Buat dan bergabung dalam aksi lingkungan berbasis komunitas |
| Eco-Points | Sistem poin gamifikasi yang menghargai pelaporan, voting, dan partisipasi |
| SOS Darurat | Akses cepat ke layanan darurat nasional (112, 113, 110, dll.) |
| Peringatan Gempa BMKG | Data gempa real-time dengan kode warna berdasarkan magnitudo |
| Pencarian | Pencarian teks lengkap untuk laporan di semua kategori dan kecamatan |

### Pemerintah

| Fitur | Deskripsi |
|---|---|
| Triage Cockpit | Daftar laporan real-time yang diurutkan berdasarkan tingkat keparahan |
| Manajemen Laporan | Filter, cari, dan perbarui status laporan dengan aksi sesuai peran |
| Bukti Resolusi | Kirim bukti resolusi dengan foto dan catatan (verified feedback) |
| Pemantauan Peta | Peta interaktif dengan marker laporan dan analisis hotspot per kecamatan |
| Dasbor Analitik | Skor responsivitas, distribusi kategori, dan timeline aktivitas |
| Profil Kinerja | Tingkat respons, statistik resolusi, dan riwayat aktivitas |
| Supabase Realtime | Berlangganan langsung untuk pembaruan detail laporan instan tanpa refresh |

### Super-Admin

| Fitur | Deskripsi |
|---|---|
| Dasbor Admin | Statistik sistem secara keseluruhan, jumlah pengguna, dan log aktivitas |
| Manajemen Pengguna | Daftar semua pengguna, buat akun, ubah peran, suspend/aktifkan |
| Moderasi Konten | Tinjau dan moderasi konten yang dilaporkan |
| Pengaturan Sistem | Konfigurasi aplikasi tingkat global |

---

## Tech Stack

### Frontend (repositori ini)

| Teknologi | Versi | Tujuan |
|---|---|---|
| React Native | 0.81.5 | Framework mobile lintas platform |
| Expo | 54 | Toolchain pengembangan dan layanan build |
| TypeScript | 5.9 | Pengembangan dengan tipe data aman |
| Expo Router | 6 | Navigasi dan perutean berbasis file |
| NativeWind | 4.2 | Styling React Native dengan Tailwind CSS |
| Phosphor Icons | 3.0 | Ikonografi yang konsisten |
| React Native Reanimated | 4.1 | Animasi performa tinggi |
| React Native SVG | 15.15 | Grafis vektor untuk bagan analitik |
| Supabase JS | 2.98 | Langganan Realtime dan akses klien langsung |
| Bottom Sheet | 5.2 | Komponen bottom sheet berbasis gestur |

### Backend ([repositori terpisah](https://github.com/StackHorizon-ProxoCoris/backend-mobileapp))

| Teknologi | Versi | Tujuan |
|---|---|---|
| Express.js | 5 | Framework REST API |
| TypeScript | 5.9 | Pengembangan backend dengan tipe data aman |
| Supabase | 2.97 | Database PostgreSQL dan autentikasi |
| Google Gemini AI | 1.43 | Layanan asisten chat AI |
| Expo Server SDK | 6.0 | Pengiriman notifikasi push |

---

## Repositori Terkait

| Repositori | Deskripsi |
|---|---|
| [Backend API](https://github.com/StackHorizon-ProxoCoris/backend-mobileapp) | Server REST API Express.js |
| **Frontend (repo ini)** | Aplikasi mobile React Native |

---

## Prasyarat

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Expo CLI**: `npm install -g expo-cli`
- **EAS CLI** (untuk build): `npm install -g eas-cli`
- **Android Studio** dengan Android SDK (untuk emulator) atau perangkat Android fisik dengan Expo Go
- Instance [Backend API](https://github.com/StackHorizon-ProxoCoris/backend-mobileapp) yang sedang berjalan

---

## Instalasi

Karena SIAGA bergantung pada aplikasi frontend dan API backend, **Anda harus mengatur dan menjalankan backend terlebih dahulu** sebelum frontend dapat berfungsi dengan baik.

### Bagian 1: Persiapan Backend

1. Clone repositori backend:
```bash
git clone https://github.com/StackHorizon-ProxoCoris/backend-mobileapp.git
cd backend-mobileapp
```

2. Instal dependensi:
```bash
npm install
```

3. Konfigurasi environment variables (Supabase, Gemini, dll.):
```bash
cp .env.example .env
```
*(Edit `.env` dengan kredensial Anda sesuai petunjuk di README backend)*

4. Jalankan migrasi database (001-015) pada Supabase SQL Editor Anda.

5. Mulai server backend:
```bash
npm run dev
```
*(Untuk instruksi backend lebih detail, lihat [README Backend](https://github.com/StackHorizon-ProxoCoris/backend-mobileapp))*

### Bagian 2: Persiapan Frontend

1. Buka terminal baru dan clone repositori frontend:
```bash
git clone https://github.com/StackHorizon-ProxoCoris/frontend-mobileapp.git
cd frontend-mobileapp
```

2. Instal dependensi:
```bash
npm install
```

3. Konfigurasi Supabase Realtime (diperlukan untuk pembaruan langsung):

> [!IMPORTANT]
> Aplikasi menggunakan `@supabase/supabase-js` untuk langganan Realtime pada layar detail laporan. URL Supabase dan anon key dikonfigurasi di `services/supabase.ts`. Pastikan proyek Supabase Anda telah mengaktifkan Realtime untuk tabel `reports`.

4. Konfigurasi endpoint API (opsional untuk pengembangan):

> [!NOTE]
> Selama pengembangan, aplikasi secara otomatis mendeteksi IP backend dari dev server Expo. Tidak diperlukan konfigurasi manual jika backend berjalan pada port `3000` di mesin yang sama.

Untuk build produksi, atur URL API di `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://your-production-api.com/api"
    }
  }
}
```

5. Bersihkan cache Metro bundler (direkomendasikan setelah berpindah branch atau merge besar):

```bash
npx expo start -c
```

---

## Menjalankan Aplikasi

> [!IMPORTANT]
> Pastikan server backend sudah berjalan sebelum memulai aplikasi. Frontend memerlukan koneksi API aktif untuk semua fitur yang bergantung pada data.

Mulai server pengembangan Expo:

```bash
npx expo start
```

Kemudian pilih target Anda:

| Perintah | Target |
|---|---|
| `npx expo start --android` | Emulator atau perangkat Android |
| `npx expo start --ios` | Simulator iOS (khusus macOS) |
| Tekan `a` di terminal | Buka di perangkat Android yang terhubung |
| Scan QR code | Buka di Expo Go pada perangkat fisik |

---

## Membangun APK

SIAGA menggunakan [EAS Build](https://docs.expo.dev/build/introduction/) untuk menghasilkan binary aplikasi yang siap produksi.

1. Autentikasi dengan Expo:

```bash
eas login
```

2. Bangun APK preview (distribusi internal):

```bash
eas build --platform android --profile preview
```

3. Bangun AAB produksi (untuk Play Store):

```bash
eas build --platform android --profile production
```

> [!TIP]
> Gunakan profil `preview` untuk pengujian dan submisi kompetisi. Ini menghasilkan file `.apk` yang dapat diinstal langsung. Profil `production` menghasilkan bundle `.aab` yang ditujukan untuk distribusi Google Play Store.

---

## Struktur Proyek

```
frontend-mobileapp/
├── app/                          # Layar (perutean berbasis file)
│   ├── (tabs)/                   # Layar tab Warga
│   │   ├── index.tsx             #   Home — feed laporan, status area, aksi cepat
│   │   ├── lapor.tsx             #   Lapor — buat laporan dan aksi positif
│   │   ├── pantau.tsx            #   Pantau — peta interaktif dengan bottom sheet
│   │   ├── aichat.tsx            #   AI Chat — asisten bertenaga Gemini
│   │   └── profil.tsx            #   Profil — statistik user, eco-points, pengaturan
│   ├── (gov-tabs)/               # Layar tab Pemerintah
│   │   ├── index.tsx             #   Triage Cockpit — laporan terurut urgensi
│   │   ├── laporan.tsx           #   Manajemen laporan — filter, cari, update
│   │   ├── peta.tsx              #   Pemantauan peta — marker dan hotspot
│   │   ├── analytics.tsx         #   Analitik — responsivitas, kategori, timeline
│   │   └── profil-gov.tsx        #   Profil Gov — kinerja dan aktivitas
│   ├── (admin-tabs)/             # Layar tab Super-admin
│   │   ├── index.tsx             #   Dasbor Admin — statistik sistem
│   │   ├── users.tsx             #   Manajemen pengguna — daftar, buat, peran
│   │   ├── moderation.tsx        #   Moderasi konten
│   │   ├── analytics.tsx         #   Dasbor analitik
│   │   ├── settings.tsx          #   Pengaturan sistem
│   │   └── profil-admin.tsx      #   Profil admin
│   ├── (auth)/                   # Layar autentikasi
│   │   ├── login.tsx             #   Login dengan modal reset password
│   │   └── register.tsx          #   Registrasi multi-langkah
│   ├── report-detail.tsx         # Detail laporan — vote, verifikasi, komentar, Realtime
│   ├── action-detail.tsx         # Detail aksi — gabung, keluar, komentar
│   ├── cari.tsx                  # Pencarian teks lengkap di seluruh laporan
│   ├── info-detail.tsx           # Tampilan detail artikel
│   ├── notifikasi.tsx            # Kotak masuk notifikasi
│   ├── edit-profil.tsx           # Ubah profil warga
│   ├── edit-profil-gov.tsx       # Ubah profil gov dengan field NIP/jabatan
│   ├── admin-user-detail.tsx     # Admin: tampilan detail pengguna
│   ├── tambah-pengguna.tsx       # Admin: buat pengguna baru
│   ├── moderasi-detail.tsx       # Admin: detail moderasi
│   ├── semua-aksi.tsx            # Telusuri semua aksi positif
│   ├── semua-info.tsx            # Telusuri semua artikel info
│   ├── riwayat-aktivitas.tsx     # Timeline riwayat aktivitas pengguna
│   ├── pengaturan.tsx            # Pengaturan pengguna
│   ├── pengaturan-sistem.tsx     # Admin: pengaturan sistem
│   ├── ganti-password.tsx        # Ganti password
│   ├── akses-keamanan.tsx        # Pengaturan akses keamanan
│   ├── bantuan.tsx               # Pusat bantuan
│   ├── tentang.tsx               # Halaman tentang
│   ├── feedback.tsx              # Kirim feedback
│   └── _layout.tsx               # Layout root — auth guard, notifikasi push
├── components/
│   └── ui/                       # Komponen UI yang dapat digunakan kembali
│       ├── MapPicker.tsx          #   Pemilih pin peta interaktif
│       ├── MapView.tsx            #   Peta Leaflet dengan marker laporan
│       ├── SOSButton.tsx          #   Tombol SOS melayang dengan animasi pulse
│       ├── SOSModal.tsx           #   Modal kontak darurat
│       ├── SectionHeader.tsx      #   Header bagian dengan tombol aksi
│       └── Toast.tsx              #   Sistem notifikasi toast
├── services/                     # Lapisan layanan API
│   ├── api.ts                    #   Klien HTTP dengan auto-detection dan auth
│   ├── supabase.ts               #   Klien Supabase untuk langganan Realtime
│   ├── report.service.ts         #   CRUD laporan, voting, statistik
│   ├── action.service.ts         #   CRUD aksi positif, gabung/keluar
│   ├── comment.service.ts        #   Operasi komentar
│   ├── notification.service.ts   #   Manajemen kotak masuk notifikasi
│   ├── bmkg.service.ts           #   Data gempa BMKG
│   ├── area-status.service.ts    #   Status area tingkat kecamatan
│   ├── admin.service.ts          #   Manajemen pengguna admin dan analitik
│   ├── info.service.ts           #   Artikel info dan konten edukasi
│   └── activity.service.ts       #   Riwayat aktivitas pengguna
├── context/
│   └── auth.tsx                  # Konteks autentikasi dan state pengguna
├── contexts/
│   └── toast.context.tsx         # Konteks notifikasi toast global
├── hooks/
│   ├── useCurrentLocation.ts     # Hook lokasi GPS dengan izin
│   └── usePushNotifications.ts   # Registrasi dan penanganan notifikasi push
├── constants/
│   └── theme.ts                  # Palet warna dan token desain
├── assets/                       # Ikon aplikasi, splash screen, gambar statis
├── app.json                      # Konfigurasi Expo
├── eas.json                      # Profil EAS Build
├── tailwind.config.js            # Konfigurasi NativeWind/Tailwind
└── tsconfig.json                 # Konfigurasi TypeScript
```

---

## Dokumentasi Teknis

Dokumentasi utama ditulis dalam Bahasa Inggris. Anda juga dapat menemukan set dokumentasi lengkap yang diterjemahkan ke dalam **Bahasa Indonesia** di direktori [docs/id/](./docs/id/).

| Dokumen | Versi Inggris (Utama) | Versi Indonesia |
|---|---|---|
| Arsitektur | [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | [ARCHITECTURE.md](./docs/id/ARCHITECTURE.md) |
| ERD | [ERD.md](./docs/ERD.md) | [ERD.md](./docs/id/ERD.md) |
| Struktur Data | [DATA_STRUCTURES.md](./docs/DATA_STRUCTURES.md) | [DATA_STRUCTURES.md](./docs/id/DATA_STRUCTURES.md) |
| Alur Sistem | [SYSTEM_FLOW.md](./docs/SYSTEM_FLOW.md) | [SYSTEM_FLOW.md](./docs/id/SYSTEM_FLOW.md) |
| Diagram Use Case | [USE_CASE_DIAGRAM.md](./docs/USE_CASE_DIAGRAM.md) | [USE_CASE_DIAGRAM.md](./docs/id/USE_CASE_DIAGRAM.md) |
| Dokumentasi API | [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) | [API_DOCUMENTATION.md](./docs/id/API_DOCUMENTATION.md) |

---

## Tim

**Tim StackHorizon** — Universitas Klabat

---

*Dibangun dengan tujuan untuk ProxoCoris 2026*
