/**
 * CLOUDFLARE EMAIL ROUTING WORKER UNTUK FLATIMO MAIL
 * 
 * Cara Penggunaan:
 * 1. Buka Cloudflare Dashboard -> Workers & Pages -> Create Application -> Create Worker.
 * 2. Hapus semua kode default dan PASTE seluruh isi file ini.
 * 3. Ganti VERCEL_WEBHOOK_URL dengan URL Vercel / domain web kamu.
 * 4. Simpan & Deploy Worker.
 * 5. Buka Menu "Email Routing" di domain Cloudflare kamu:
 *    - Aktifkan Catch-all Rule (atau Custom Address).
 *    - Action: "Send to Worker" -> Pilih Worker ini.
 * 6. Selesai! Semua email yang masuk ke domain kamu otomatis langsung terkirim ke Flatimo Mail di Vercel.
 */

// Ganti dengan URL deployment Vercel atau Domain Utama kamu
const VERCEL_WEBHOOK_URL = 'https://YOUR-APP.vercel.app/api/v1/webhook/incoming';
// Opsional: Secret key jika mode webhook privat (kosongkan jika publik)
const WEBHOOK_SECRET = '';

export default {
  async email(message, env, ctx) {
    try {
      // 1. Baca raw email MIME stream
      const rawEmail = await new Response(message.raw).text();
      const targetUrl = env.VERCEL_WEBHOOK_URL || VERCEL_WEBHOOK_URL;
      const secret = env.WEBHOOK_SECRET || WEBHOOK_SECRET;

      // 2. Kirim raw email ke Webhook Vercel
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'X-Forwarded-To': message.to,
          'X-Forwarded-From': message.from,
          ...(secret ? { 'X-Webhook-Secret': secret } : {})
        },
        body: rawEmail
      });

      if (!response.ok) {
        console.error(`[Email Worker] Gagal meneruskan email ke Vercel: HTTP ${response.status}`);
      } else {
        console.log(`[Email Worker] Berhasil meneruskan email ${message.from} -> ${message.to} ke Vercel.`);
      }
    } catch (err) {
      console.error('[Email Worker] Terjadi kesalahan:', err.message);
    }
  }
};
