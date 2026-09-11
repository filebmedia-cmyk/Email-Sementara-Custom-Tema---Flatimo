# 🚀 PANDUAN LENGKAP DEPLOY FLATIMO MAIL KE VERCEL & CLOUDFLARE

Panduan ini memandu Anda memindahkan Flatimo Mail ke **Vercel** (Hosting Web & API) dan **Cloudflare Email Routing** (Penerimaan Email Masuk) agar berjalan **100% GRATIS SELAMANYA** tanpa perlu bayar/sewa VPS lagi.

---

## 📌 LANGKAH 1: Push Kode ke Akun GitHub Anda

1. Buka [GitHub.com](https://github.com) dan buat repository baru (misal: `flatimo-mail`).
2. Di komputer / terminal proyek Anda, jalankan perintah berikut:

```bash
git init
git add .
git commit -m "Initial commit - Ready for Vercel & Cloudflare"
git branch -M main
git remote add origin https://github.com/USERNAME-ANDA/flatimo-mail.git
git push -u origin main
```
*(Ganti `USERNAME-ANDA` dengan username GitHub Anda).*

---

## 📌 LANGKAH 2: Deploy ke Vercel (1-Click)

1. Buka [Vercel.com](https://vercel.com) dan login menggunakan akun GitHub Anda.
2. Klik tombol **"Add New..."** ➔ **"Project"**.
3. Pilih repository `flatimo-mail` yang baru Anda buat, lalu klik **"Import"**.
4. Di bagian **Environment Variables**, Anda bisa menambahkan (opsional):
   - `DOMAINS` : `mailflatimo.web.id,flatimostore.my.id,flatimo.me`
   - `API_KEY` : `FLATIMOSTORE`
5. Klik **"Deploy"**. Tunggu 1-2 menit hingga statusnya selesai (**Ready**).
6. **Pasang Custom Domain di Vercel**:
   - Buka menu **Settings** ➔ **Domains** di project Vercel Anda.
   - Tambahkan domain/subdomain Anda (misal: `mailflatimo.web.id`).
   - Ikuti petunjuk DNS (biasanya berupa CNAME `cname.vercel-dns.com` atau A Record).

---

## 📌 LANGKAH 3: Setting Cloudflare Email Routing (Menerima Email Masuk)

Agar domain Anda bisa menerima email masuk tanpa VPS:

### 3.1 Buat Cloudflare Email Worker
1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com) ➔ Buka menu **Workers & Pages** ➔ Klik **Create application** ➔ **Create Worker**.
2. Beri nama (misal: `flatimo-email-forwarder`), lalu klik **Deploy**.
3. Klik **Edit Code**, hapus semua kode bawaan, lalu **PASTE** kode dari file `cloudflare/email-worker.js`.
4. Pada baris ke-15 di kode tersebut:
   ```javascript
   const VERCEL_WEBHOOK_URL = 'https://mailflatimo.web.id/api/v1/webhook/incoming';
   ```
   *(Ganti dengan URL domain Vercel Anda).*
5. Klik **Save and deploy**.

### 3.2 Aktifkan Email Routing di Domain Cloudflare
1. Buka domain Anda di Cloudflare (misal `mailflatimo.web.id` atau `kingcapcut.biz.id`).
2. Masuk ke menu **Email Routing** di sidebar kiri.
3. Klik **Enable Email Routing** (Cloudflare akan otomatis menambahkan MX Record yang diperlukan).
4. Masuk ke tab **Routing Rules**:
   - Di bagian **Catch-all rule**, klik **Edit**.
   - Action: Pilih **Send to a Worker**.
   - Destination: Pilih worker yang tadi Anda buat (`flatimo-email-forwarder`).
   - Status: **Active** ➔ Klik **Save**.
5. **Selesai!** Sekarang semua email yang dikirim ke alamat apapun di domain tersebut (`user@mailflatimo.web.id`, `testing@kingcapcut.biz.id`, dll.) akan langsung masuk secara instan ke Web Flatimo Mail Anda!

---

## 📌 LANGKAH 4 (Opsional): Hubungkan Database Cloud Gratis (Upstash Redis)

Agar data pesan dan pengaturan PIN/Tema tersimpan permanen di cloud:
1. Buka [Upstash.com](https://upstash.com) dan login (Gratis 10.000 request/hari).
2. Buat database **Redis** baru (Pilih region terdekat: misal Singapore).
3. Salin:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Masukkan kedua variabel tersebut ke menu **Settings ➔ Environment Variables** di Vercel, lalu re-deploy.

---

### 🎉 Selesai!
Sekarang Flatimo Mail Anda sudah online 24 jam nonstop di Vercel secara gratis, aman dari risiko VPS mati, dan dapat menerima email dari domain manapun secara instan.
