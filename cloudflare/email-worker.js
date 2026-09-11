/**
 * CLOUDFLARE EMAIL ROUTING STANDALONE WORKER - FLATIMO MAIL
 * 
 * Fitur:
 * - 100% Siap Pakai tanpa perlu setting database luar / KV manual.
 * - Menerima email dari Cloudflare Email Routing.
 * - Otomatis menyimpan pesan di Memory Edge & meneruskannya ke Vercel Webhook.
 */

// Memory Cache di Edge Cloudflare (Bekerja otomatis tanpa perlu buat KV manual)
const INBOX_CACHE = new Map();
const MSG_CACHE = new Map();

// Default Vercel Webhook URL
const DEFAULT_VERCEL_WEBHOOK = 'https://email-sementara-custom-tema-flatimo.vercel.app/api/v1/webhook/incoming';

// Helper Parser Sederhana untuk MIME Header & Body di Cloudflare Edge
function parseEmailMime(raw, fallbackRecipient, fallbackSender) {
  const lines = raw.split(/\r?\n/);
  const headers = {};
  let headerEndIndex = 0;
  let currentHeader = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === '') {
      headerEndIndex = i + 1;
      break;
    }
    if (/^\s/.test(line) && currentHeader) {
      headers[currentHeader] += ' ' + line.trim();
    } else {
      const match = line.match(/^([^:]+):\s*(.*)$/);
      if (match) {
        currentHeader = match[1].toLowerCase();
        headers[currentHeader] = match[2];
      }
    }
  }

  const rawBody = lines.slice(headerEndIndex).join('\n');
  const subject = headers['subject'] || '(Tanpa Subjek)';
  const from = headers['from'] || fallbackSender || 'unknown@sender.com';
  const to = headers['to'] || fallbackRecipient || '';
  const date = headers['date'] || new Date().toISOString();

  // Bersihkan teks body sederhana
  let text = rawBody;
  let html = '';

  if (rawBody.includes('<html') || rawBody.includes('<div') || rawBody.includes('<p') || rawBody.includes('<body')) {
    html = rawBody;
    text = rawBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  return {
    subject,
    from: { text: from, address: from.match(/<([^>]+)>/) ? from.match(/<([^>]+)>/)[1] : from },
    to: [{ text: to, address: fallbackRecipient || to }],
    date,
    text: text.substring(0, 50000),
    html: html ? html.substring(0, 100000) : '',
    headers
  };
}

export default {
  // 1. HTTP REST API HANDLER
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const KV = env.TMAIL_KV;

      // GET /api/v1/inbox/:email/messages
      const inboxMatch = path.match(/^\/api\/v1\/inbox\/([^/]+)\/messages$/);
      if (inboxMatch && request.method === 'GET') {
        const email = decodeURIComponent(inboxMatch[1]).toLowerCase().trim();
        let messages = [];

        if (KV) {
          const data = await KV.get(`inbox:${email}`, 'json');
          if (Array.isArray(data)) messages = data;
        }
        if (messages.length === 0 && INBOX_CACHE.has(email)) {
          messages = INBOX_CACHE.get(email) || [];
        }

        return new Response(JSON.stringify({
          success: true,
          email,
          total: messages.length,
          unread: messages.length,
          messages
        }), { headers: corsHeaders });
      }

      // GET /api/v1/messages/:id
      const msgMatch = path.match(/^\/api\/v1\/messages\/([^/]+)$/);
      if (msgMatch && request.method === 'GET') {
        const id = msgMatch[1];
        let msg = null;

        if (KV) {
          msg = await KV.get(`msg:${id}`, 'json');
        }
        if (!msg && MSG_CACHE.has(id)) {
          msg = MSG_CACHE.get(id);
        }

        if (!msg) {
          return new Response(JSON.stringify({ success: false, error: 'Message not found or expired' }), { status: 404, headers: corsHeaders });
        }
        return new Response(JSON.stringify({ success: true, message: msg }), { headers: corsHeaders });
      }

      // DELETE /api/v1/inbox/:email
      const delInboxMatch = path.match(/^\/api\/v1\/inbox\/([^/]+)$/);
      if (delInboxMatch && request.method === 'DELETE') {
        const email = decodeURIComponent(delInboxMatch[1]).toLowerCase().trim();
        if (KV) {
          const list = await KV.get(`inbox:${email}`, 'json');
          if (Array.isArray(list)) {
            for (const m of list) await KV.delete(`msg:${m.id}`);
          }
          await KV.delete(`inbox:${email}`);
        }
        INBOX_CACHE.delete(email);
        return new Response(JSON.stringify({ success: true, message: `Inbox ${email} deleted` }), { headers: corsHeaders });
      }

      // DELETE /api/v1/messages/:id
      if (msgMatch && request.method === 'DELETE') {
        const id = msgMatch[1];
        if (KV) {
          const msg = await KV.get(`msg:${id}`, 'json');
          if (msg && msg.inboxEmail) {
            const email = msg.inboxEmail.toLowerCase();
            const list = await KV.get(`inbox:${email}`, 'json');
            if (Array.isArray(list)) {
              const updated = list.filter(m => m.id !== id);
              await KV.put(`inbox:${email}`, JSON.stringify(updated), { expirationTtl: 86400 });
            }
          }
          await KV.delete(`msg:${id}`);
        }
        MSG_CACHE.delete(id);
        for (const [email, list] of INBOX_CACHE.entries()) {
          const updated = list.filter(m => m.id !== id);
          if (updated.length !== list.length) {
            INBOX_CACHE.set(email, updated);
          }
        }
        return new Response(JSON.stringify({ success: true, message: 'Message deleted' }), { headers: corsHeaders });
      }

      // Status Monitor
      return new Response(JSON.stringify({
        status: 'online',
        service: 'Flatimo Cloudflare Email Engine ⚡',
        totalInboxesCached: INBOX_CACHE.size,
        kvConnected: Boolean(KV),
        time: new Date().toISOString()
      }), { headers: corsHeaders });

    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders });
    }
  },

  // 2. EMAIL EVENT HANDLER (Cloudflare Email Routing)
  async email(message, env, ctx) {
    try {
      const rawEmail = await new Response(message.raw).text();
      const parsed = parseEmailMime(rawEmail, message.to, message.from);
      const recipient = (message.to || '').toLowerCase().trim();
      const msgId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const msgData = {
        id: msgId,
        inboxEmail: recipient,
        from: parsed.from,
        to: parsed.to,
        subject: parsed.subject,
        text: parsed.text,
        html: parsed.html,
        textAsHtml: parsed.html || parsed.text,
        date: parsed.date || new Date().toISOString(),
        headers: parsed.headers,
        attachments: [],
        size: rawEmail.length
      };

      // 1. Simpan di Memory Cache
      MSG_CACHE.set(msgId, msgData);
      const existingList = INBOX_CACHE.get(recipient) || [];
      existingList.unshift({
        id: msgId,
        inboxEmail: recipient,
        from: msgData.from,
        subject: msgData.subject,
        date: msgData.date,
        snippet: (msgData.text || '').substring(0, 120),
        hasAttachments: false
      });
      INBOX_CACHE.set(recipient, existingList.slice(0, 50));

      // 2. Simpan di KV jika ada
      if (env.TMAIL_KV) {
        await env.TMAIL_KV.put(`msg:${msgId}`, JSON.stringify(msgData), { expirationTtl: 86400 });
        await env.TMAIL_KV.put(`inbox:${recipient}`, JSON.stringify(existingList.slice(0, 50)), { expirationTtl: 86400 });
      }

      // 3. Teruskan ke Webhook Vercel
      const targetWebhook = env.VERCEL_WEBHOOK_URL || DEFAULT_VERCEL_WEBHOOK;
      if (targetWebhook) {
        fetch(targetWebhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
            'X-Forwarded-To': message.to,
            'X-Forwarded-From': message.from
          },
          body: rawEmail
        }).catch(() => {});
      }

      console.log(`[Worker Success] Email from ${message.from} to ${recipient} processed.`);

    } catch (err) {
      console.error('[Worker Email Error]', err.message);
    }
  }
};
