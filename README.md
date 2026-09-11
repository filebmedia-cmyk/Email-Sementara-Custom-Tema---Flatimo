# ⚡ Flatimo Mail - High-Speed Disposable Temporary Email System

**Flatimo Mail** adalah sistem web Temporary Email (T-Mail) modern dan berkinerja tinggi dengan antarmuka futuristik bertema **Neon Glow / Pixel / Modern Theme**, dukungan multi-domain fleksibel, integrasi **Vercel Serverless + Cloudflare Email Routing**, serta built-in **SMTP Inbound Engine & Public REST API**.

![Flatimo Mail](https://img.shields.io/badge/Flatimo%20Mail-v1.0-FFB800?style=for-the-badge&logo=fastapi&logoColor=black)
![Vercel Ready](https://img.shields.io/badge/Deploy-Vercel%20Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Email%20Routing-Cloudflare%20Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-FF5500?style=for-the-badge)

---

## 📂 Struktur Direktori Proyek

```
Tmail-Flatimo/
├── 📁 api/                   # Vercel Serverless function entry point
│   └── index.js
├── 📁 cloudflare/            # Cloudflare Worker Email Forwarder script
│   └── email-worker.js
├── 📁 docs/                  # Panduan & Dokumentasi lengkap
│   ├── PANDUAN_DEPLOY_VERCEL.md
│   └── PANDUAN_INSTALL_VPS.md
├── 📁 public/                # Asset publik statis (favicon, icons)
│   └── favicon.svg
├── 📁 scripts/               # Utility scripts (VPS diagnostics, DNS helper)
│   ├── deploy_theme_to_vps.js
│   ├── deploy_to_vps.js
│   ├── sync_dns_details.js
│   └── ...
├── 📁 server/                # Backend Node.js / Express engine
│   ├── app.js               # Universal Express app logic
│   ├── config.js            # Environment loader & config
│   ├── db.js                # Database handler (Local JSON / Upstash Redis)
│   ├── eventBus.js          # In-memory pub/sub for real-time events
│   ├── index.js             # Standalone entry point (HTTP + SMTP server)
│   ├── smtp.js              # Inbound SMTP listener (port 25)
│   ├── telegramBot.js       # Telegram Bot integration
│   ├── routes/              # REST API, SSE stream, & Webhook routes
│   └── utils/               # E-mail parsers & storage cleaner
├── 📁 src/                   # Frontend React SPA (Vite + Tailwind CSS)
│   ├── components/          # UI Components (Inbox, Viewer, Domain, Theme, dll.)
│   ├── context/             # React Theme & State Context
│   ├── utils/               # Sound synthesizers, API clients
│   ├── App.jsx              # Main App router & layout
│   └── main.jsx             # React DOM root entry
├── .gitignore               # Git ignored patterns
├── index.html               # SPA HTML entry point
├── package.json             # NPM dependencies & scripts
├── postcss.config.js        # PostCSS configuration
├── tailwind.config.js       # Tailwind CSS theme & design system
├── vercel.json              # Konfigurasi routing Vercel Serverless
└── vite.config.js           # Vite build bundler configuration
```

---

## ✨ Fitur Unggulan

- ⚡ **Multi-Theme & Custom Font**: Pilihan tema Dark/Light/Pixel, font Pixel Retro & Modern, serta custom background dinamis.
- 📬 **Dua Mode Penerimaan Email**:
  - **Mode Serverless (Vercel + Cloudflare)**: 100% Gratis selamanya tanpa perlu sewa VPS.
  - **Mode VPS / Dedicated Server**: Built-in SMTP port 25 bawaan.
- 📡 **Real-time 1-Second Auto Refresh & SSE**: Kotak masuk diperbarui secara otomatis setiap detik, lengkap dengan tombol refresh manual dan chime sound notifikasi.
- 🌐 **Multi-Domain & Direct Link Routing**: Akses instan ke inbox spesifik melalui URL browser (contoh: `https://domainanda.com/username@domain.com`).
- 🛡️ **Aman & Sandboxed**: Pembaca HTML terisolasi dari XSS injection, dukungan preview lampiran (Attachments), dan unduh file mentah (*Raw EML*).
- 🤖 **Integrasi Notifikasi Telegram Bot**: Notifikasi instan ke Telegram saat email yang diminta masuk.
- 📢 **Web Notification & Promo Modal**: Pop-up promosi / pengumuman kustom dengan teks, gambar, dan tombol On/Off.

---

## 🚀 Pilihan Cara Deploy

### 1. Deploy ke Vercel (Gratis & Direkomendasikan) ⭐
Sistem ini sudah dioptimalkan untuk Vercel Serverless Functions + Cloudflare Email Routing:
👉 **[Baca Panduan Lengkap Deploy Vercel](docs/PANDUAN_DEPLOY_VERCEL.md)**

### 2. Deploy ke VPS / Linux Server (Port 25 SMTP)
Bagi yang ingin menjalankan full standalone instance di VPS Ubuntu/Debian menggunakan PM2:
👉 **[Baca Panduan Lengkap Deploy VPS](docs/PANDUAN_INSTALL_VPS.md)**

---

## 🛠️ Menjalankan di Komputer Lokal (Development)

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Jalankan Aplikasi
```bash
npm run dev
```
Buka browser di: `http://localhost:3000`

---

## 📄 Lisensi
Didistribusikan di bawah Lisensi MIT. Dikembangkan dengan ⚡ oleh **Flatimo**.

