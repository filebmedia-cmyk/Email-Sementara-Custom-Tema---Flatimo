# ⚡ Panduan Lengkap: Cara Install & Menjalankan Flatimo Mail di VPS

Panduan ini berisi langkah-langkah praktis mulai dari awal (fresh VPS) hingga Flatimo Mail online dan berjalan 24 jam nonstop.

---

## 📋 1. Prasyarat Server (VPS)
- **OS Disarankan**: Ubuntu 20.04 / 22.04 / 24.04 LTS atau Debian 11 / 12
- **Port yang Harus Terbuka**:
  - Port `80` (HTTP Web UI)
  - Port `25` (Inbound SMTP Mail Ingestion)
  - Port SSH (biasanya `22` atau port kustom VPS Anda)

---

## 🚀 2. Langkah-Langkah Instalasi di VPS

### Langkah 1: Login ke VPS via SSH
Buka terminal (PowerShell, Command Prompt, atau Termius / PuTTY) di komputer Anda, lalu jalankan:
```bash
ssh root@IP_VPS_ANDA -p PORT_SSH
```
*(Masukkan password root VPS Anda saat diminta).*

---

### Langkah 2: Update Server & Install Node.js + Git + PM2
Jalankan perintah berikut untuk meng-update sistem dan menginstal Node.js versi 20+ serta PM2 (pengelola proses 24 jam):
```bash
# 1. Update paket server
apt update && apt upgrade -y

# 2. Install Curl & Git
apt install -y curl git ufw

# 3. Install Node.js (v20 LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 4. Install PM2 secara global
npm install -g pm2

# 5. Cek versi terinstall
node -v && npm -v && pm2 -v
```

---

### Langkah 3: Siapkan Folder & Source Code
Buat folder untuk aplikasi di direktori `/var/www/`:
```bash
# Buat folder proyek
mkdir -p /var/www/flatimo-mail
cd /var/www/flatimo-mail
```

*(Jika Anda menggunakan Git repository):*
```bash
git clone <URL_REPO_ANDA> /var/www/flatimo-mail
cd /var/www/flatimo-mail
```

---

### Langkah 4: Buat File Konfigurasi Environment (`.env`)
Buat file `.env` di dalam folder `/var/www/flatimo-mail/`:
```bash
nano .env
```
Isi dengan konfigurasi berikut (sesuaikan domain dan API key Anda):
```env
PORT=80
SMTP_PORT=25
NODE_ENV=production
DOMAINS=flatimostore.my.id,flatimo.me,flatmail.dev
RETENTION_HOURS=24
MAX_ATTACHMENT_SIZE_MB=15
API_KEY=FLATIMOSTORE
API_KEYS=FLATIMOSTORE
WEBHOOK_SECRET=flatimo_secret_123
```
*Tekan `CTRL + O`, lalu `ENTER` untuk menyimpan, kemudian `CTRL + X` untuk keluar dari nano.*

---

### Langkah 5: Install Dependencies & Build Frontend
Jalankan perintah instalasi dependensi dan kompilasi tampilan:
```bash
npm install
npm run build
```

---

### Langkah 6: Jalankan Flatimo Mail 24 Jam dengan PM2
Jalankan aplikasi di background agar tidak pernah mati meskipun terminal ditutup:
```bash
# Jalankan aplikasi
pm2 start server/index.js --name "flatimo-mail"

# Simpan agar otomatis hidup saat VPS reboot/restart
pm2 save
pm2 startup
```

---

### Langkah 7: Buka Firewall Server (Jika Menggunakan UFW)
```bash
ufw allow 80/tcp
ufw allow 25/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw --force enable
```

---

## 🛠️ 3. Perintah Berguna PM2 untuk Monitoring

| Perintah | Fungsi |
|---|---|
| `pm2 status` | Melihat status apakah Flatimo Mail sedang `online` |
| `pm2 logs flatimo-mail` | Melihat log email masuk secara live (real-time) |
| `pm2 restart flatimo-mail` | Me-restart aplikasi |
| `pm2 stop flatimo-mail` | Menghentikan aplikasi sementara |
| `pm2 reload flatimo-mail` | Reload aplikasi tanpa downtime (zero-downtime) |

---

## 🧪 4. Cara Cek Bahwa Web Sudah Berjalan
Buka browser di HP / Laptop:
- Akses via IP: `http://IP_VPS_ANDA`
- Akses via Domain: `http://flatimostore.my.id`

🎉 **Selamat! Flatimo Mail kini telah online dan siap melayani email sementara 24 jam nonstop!** ⚡

