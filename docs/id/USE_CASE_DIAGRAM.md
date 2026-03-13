# Diagram Use Case

Dokumen ini memberikan sudut pandang berbasis aktor terhadap kapabilitas SIAGA saat ini. Diagram di bawah memakai aset hasil export PlantUML agar dokumentasi menampilkan notasi use case UML yang standar, termasuk aktor berbentuk stickman dan batas sistem.

---

## 1. Ringkasan Aktor

| Aktor | Peran dalam Sistem |
|---|---|
| Warga | Melaporkan masalah, memantau aktivitas komunitas, ikut aksi positif, dan menerima peringatan |
| Petugas Pemerintah | Melakukan triase laporan masuk, mengubah status, mengirim bukti resolusi, dan memantau dasbor operasional |
| Super-Admin | Mengelola pengguna, peran, moderasi, analitik, dan konfigurasi tingkat sistem |
| Supabase Auth | Mendukung autentikasi, validasi sesi, dan pemulihan password |
| Gemini AI | Mendukung asisten chat keselamatan dan kesiapsiagaan bencana |
| API BMKG | Menyediakan data peringatan gempa real-time |
| Expo Push | Mengirim push notification native ke perangkat mobile |

---

## 2. Diagram Use Case Gambaran Umum

![Diagram Use Case Gambaran Umum](./usecase_diagram/system%20overview.png)

---

## 3. Diagram Use Case Warga

![Diagram Use Case Warga](./usecase_diagram/citizen%20experience.png)

---

## 4. Diagram Use Case Pemerintah dan Admin

![Diagram Use Case Pemerintah dan Admin](./usecase_diagram/Goverment%20and%20admin.png)

---

## 5. Catatan Ruang Lingkup

- Diagram berfokus pada kapabilitas yang sudah tercermin di mobile app dan route backend saat ini.
- `Warga` dan `Petugas Pemerintah` memakai alur autentikasi yang sama, tetapi diarahkan ke dasbor berbeda sesuai role.
- `Kirim Bukti Resolusi` dimodelkan sebagai relasi `extend` karena ia merupakan keluaran khusus saat pembaruan status laporan menuju kondisi selesai.
- Layanan eksternal ditampilkan sebagai aktor pendukung agar ketergantungan terhadap Supabase Auth, Gemini, BMKG, dan Expo Push terlihat jelas.
- Aset diagram dimuat dari `docs/usecase_diagram/` agar hasilnya tetap konsisten saat dirender di GitHub setelah push.
