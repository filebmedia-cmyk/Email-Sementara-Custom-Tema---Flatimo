# ⚡ Flatimo Mail - High-Speed Disposable Temporary Email System

**Flatimo Mail** adalah aplikasi web Temporary Email (T-Mail) modern dengan desain futuristik bertema **Yellow-Orange-Black Glow**, logo vektor petir beranimasi, dukungan multi-domain via DNS (Priority 1), built-in SMTP Server port 25, endpoint webhook untuk Cloudflare, dan Public REST API gratis.

![Flatimo Mail](https://img.shields.io/badge/Flatimo%20Mail-v1.0-FFB800?style=for-the-badge&logo=fastapi&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-FF5500?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-24%2B-green?style=for-the-badge&logo=node.js)

---

## ✨ Fitur Unggulan

- ⚡ **Desain Modern Cyberpunk Glow**: Background hitam pekat dengan aksen kuning neon, oranye api, efek glow dinamis, dan logo vektor petir SVG.
- 📬 **Penerimaan Email DNS Super Cepat (Priority 1)**:
  - Cukup hubungkan domain yang dibeli di registrar dengan memasukkan record `MX` (Priority 1) & `A`.
  - Email masuk langsung diterima oleh mesin SMTP bawaan dalam hitungan milidetik.
- 📡 **Real-time Live Stream (Server-Sent Events)**:
  - Kotak masuk terupdate secara seketika (*instant push*) tanpa reload halaman, lengkap dengan efek suara notifikasi (*Web Audio API synthesized chime*).
- 🌐 **Multi-Domain Manager**:
  - Dukungan mengelola banyak domain sekaligus langsung dari UI atau konfigurasi `.env`.
- 🛡️ **Penampil Email Lengkap & Aman**:
  - Sandboxed HTML Reader (aman dari XSS & injection).
  - Tampilan teks biasa (Plaintext) & Header RFC822.
  - Dukungan pengunduhan lampiran file (*Attachments*) & file mentah (*Raw EML*).
- 🚀 **Public REST API Gratis**:
  - Dokumentasi API interaktif langsung di dalam web dengan contoh kode cURL, JavaScript, dan Python.
- 🕒 **Auto-Retention Cleanup**:
  - Pembersihan otomatis email kedaluwarsa setelah 24 jam (dapat disesuaikan di `.env`).
- 🧪 **Simulasi Tes Email Masuk**:
  - Tombol uji coba instan dengan template Google OTP, TikTok Verify, dan Invoice berkas untuk pengujian lokal.

---

## 🛠️ Panduan Instalasi & Menjalankan

### 1. Prasyarat
- Node.js versi 18+ atau lebih baru.
- Port `3000` (Web UI & API) dan Port `25` (Inbound SMTP Server untuk live domain, atau `2525` saat development).

### 2. Instalasi Dependensi
```bash
git clone https://github.com/flatimo/tmail-flatimo.git
cd Tmail-Flatimo
npm install
```

### 3. Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env` dan sesuaikan:
```env
PORT=3000
SMTP_PORT=25
NODE_ENV=production
DOMAINS=flatimo.me,flatmail.dev,tmail.one
RETENTION_HOURS=24
MAX_ATTACHMENT_SIZE_MB=15
```

### 4. Menjalankan Aplikasi
- **Mode Development**:
  ```bash
  npm run dev
  ```
- **Mode Production**:
  ```bash
  npm run build
  npm start
  ```
- Buka browser di: `http://localhost:3000`

---

## 🌐 Cara Menghubungkan Domain Baru (DNS Setup)

Buka menu **DNS Management** di tempat Anda membeli domain (Niagahoster, Domainesia, Namecheap, Cloudflare, dll), lalu tambahkan 3 baris record berikut:

| Tipe | Nama (Host) | Nilai (Value / Target) | Priority | Keterangan |
|---|---|---|---|---|
| **MX** | `@` | `mail.domainanda.com` | **`1`** | Prioritas utama nomor 1 untuk penerimaan super cepat |
| **A** | `mail` | `IP_PUBLIC_VPS_ANDA` | - | Mengarahkan server mail ke IP VPS |
| **A** | `@` | `IP_PUBLIC_VPS_ANDA` | - | Mengarahkan web tampilan ke IP VPS |

---

## 📖 Ringkasan Public REST API

| Method | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/v1/domains` | Mengambil daftar domain yang aktif |
| `GET` | `/api/v1/inbox/generate` | Membuat alamat email acak secara instan |
| `POST` | `/api/v1/inbox/create` | Membuat alamat email custom (`{"username": "...", "domain": "..."}`) |
| `GET` | `/api/v1/inbox/:email/messages` | Mengambil semua daftar pesan di inbox tersebut |
| `GET` | `/api/v1/messages/:id` | Mengambil detail pesan (HTML, Teks, Lampiran) |
| `DELETE` | `/api/v1/inbox/:email` | Menghapus inbox dan seluruh pesannya |
| `GET` | `/api/v1/inbox/:email/stream` | Server-Sent Events (SSE) stream untuk notifikasi real-time |
| `POST` | `/api/v1/webhook/incoming` | Endpoint penerima webhook (Cloudflare / Eksternal) |

---

## 🚀 Menjalankan Sebagai Service di VPS (PM2 / Systemd)

Untuk menjalankan 24/7 di latar belakang server Linux/VPS:
```bash
# Menggunakan PM2
npm install -g pm2
npm run build
pm2 start server/index.js --name "flatimo-mail"
pm2 save
pm2 startup
```

---

Dibuat dengan ⚡ oleh **Flatimo Mail Team**.
