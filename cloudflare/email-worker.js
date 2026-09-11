/**
 * CLOUDFLARE EMAIL ROUTING + KV STANDALONE ENGINE - FLATIMO MAIL
 * 
 * Fitur:
 * 1. Menerima email dari Cloudflare Email Routing.
 * 2. Menyimpan pesan secara otomatis ke Cloudflare KV (Gratis 100.000 read/hari).
 * 3. Menyediakan REST API cepat (Inbox & Messages) dengan CORS penuh.
 * 4. Mendukung Auto-Discovery Domain baru.
 */

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
        if (!KV) {
          return new Response(JSON.stringify({ success: true, email, total: 0, messages: [] }), { headers: corsHeaders });
        }
        const inboxData = await KV.get(`inbox:${email}`, 'json');
        const messages = Array.isArray(inboxData) ? inboxData : [];
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
        if (!KV) {
          return new Response(JSON.stringify({ success: false, error: 'Message not found' }), { status: 404, headers: corsHeaders });
        }
        const msg = await KV.get(`msg:${id}`, 'json');
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
            for (const m of list) {
              await KV.delete(`msg:${m.id}`);
            }
          }
          await KV.delete(`inbox:${email}`);
        }
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
        return new Response(JSON.stringify({ success: true, message: 'Message deleted' }), { headers: corsHeaders });
      }

      // Default Status Ping
      return new Response(JSON.stringify({
        status: 'online',
        service: 'Flatimo Cloudflare Email & KV Storage Engine ⚡',
        kvConnected: Boolean(KV),
        time: new Date().toISOString()
      }), { headers: corsHeaders });

    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders });
    }
  },

  // 2. EMAIL EVENT HANDLER (Cloudflare Email Routing Ingestion)
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

      // 1. Simpan ke Cloudflare KV jika namespace TMAIL_KV sudah di-bind
      if (env.TMAIL_KV) {
        // Simpan detail pesan (Auto-expire 24 jam = 86400 detik)
        await env.TMAIL_KV.put(`msg:${msgId}`, JSON.stringify(msgData), { expirationTtl: 86400 });

        // Update list inbox penerima
        const existingList = (await env.TMAIL_KV.get(`inbox:${recipient}`, 'json')) || [];
        existingList.unshift({
          id: msgId,
          inboxEmail: recipient,
          from: msgData.from,
          subject: msgData.subject,
          date: msgData.date,
          snippet: (msgData.text || '').substring(0, 120),
          hasAttachments: false
        });
        await env.TMAIL_KV.put(`inbox:${recipient}`, JSON.stringify(existingList.slice(0, 50)), { expirationTtl: 86400 });
        console.log(`[KV Success] Saved message ${msgId} for ${recipient}`);
      }

      // 2. Teruskan juga ke Vercel Webhook jika URL diisi
      if (env.VERCEL_WEBHOOK_URL) {
        fetch(env.VERCEL_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
            'X-Forwarded-To': message.to,
            'X-Forwarded-From': message.from
          },
          body: rawEmail
        }).catch(() => {});
      }

    } catch (err) {
      console.error('[Worker Email Error]', err.message);
    }
  }
};


