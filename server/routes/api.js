import express from 'express';
import { nanoid } from 'nanoid';
import dns from 'dns/promises';
import { db } from '../db.js';
import { eventBus } from '../eventBus.js';
import { config } from '../config.js';

const router = express.Router();

// Helper generate random username
const adjectives = ['swift', 'hyper', 'volt', 'spark', 'flash', 'cyber', 'quick', 'rapid', 'atomic', 'sonic', 'turbo', 'shadow'];
const nouns = ['tiger', 'falcon', 'runner', 'storm', 'mail', 'node', 'wave', 'blaze', 'hawk', 'eagle', 'echo', 'pulse'];

function generateRandomUsername() {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const randNum = Math.floor(100 + Math.random() * 900);
  return `${adj}.${noun}${randNum}`;
}

// Ultra-Flexible API Key & Authentication Middleware
router.use((req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['x-api-key'] || req.headers['api-key'] || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader;
  const apiKey = bearerToken || 
    req.query.api_key || 
    req.query.apikey || 
    req.query.key || 
    req.query.token || 
    req.body?.api_key || 
    req.body?.apiKey || 
    req.body?.key || 
    null;

  const currentSettings = db.getSettings();
  const validKeys = [currentSettings.apiKey, ...config.apiKeys].filter(Boolean).map(k => k.toUpperCase());

  if (apiKey) {
    const isMasterKey = validKeys.includes(apiKey.toUpperCase());
    req.apiKey = apiKey;
    req.isVip = isMasterKey;
  }

  // Exempt auth status, verify password, verify key, settings, and popup from strict blocking
  const publicPaths = ['/auth/status', '/auth/verify-password', '/key/verify', '/settings', '/settings/verify-pin', '/popup'];
  if (publicPaths.includes(req.path)) {
    return next();
  }

  // If API Mode is Private, require API key for external API requests
  if (currentSettings.apiMode === 'private') {
    const isBrowserRequest = req.headers['sec-fetch-site'] === 'same-origin' || req.headers['x-requested-with'] === 'XMLHttpRequest';
    const referer = req.headers['referer'] || req.headers['origin'] || '';
    const isLocalReferer = referer.includes('mailflatimo.web.id') || referer.includes('localhost') || referer.includes('127.0.0.1');
    const isInternalApp = isBrowserRequest || isLocalReferer || req.headers['x-client-app'] === 'flatimo-web' || req.headers['x-client-app'] === 'flatimo-bot';

    if (!req.isVip && !isInternalApp) {
      return res.status(401).json({
        success: false,
        error: 'Akses Ditolak: REST API sedang dalam mode Privat. Harap sertakan header X-API-Key atau parameter api_key yang valid.'
      });
    }
  }

  next();
});

// --- AUTH & SETTINGS ENDPOINTS ---

// 0.1 GET /api/v1/auth/status - Check if website password lock is ON or OFF & Public System Settings
router.get('/auth/status', (req, res) => {
  const settings = db.getSettings();
  res.json({
    success: true,
    isPasswordProtected: Boolean(settings.isPasswordProtected),
    apiMode: settings.apiMode || 'public',
    webhookMode: settings.webhookMode || 'public',
    httpDocsMode: settings.httpDocsMode || 'public',
    popupEnabled: Boolean(settings.popupEnabled),
    popupTitle: settings.popupTitle || '',
    popupMessage: settings.popupMessage || '',
    popupImageUrl: settings.popupImageUrl || '',
    popupButtonText: settings.popupButtonText || 'Lihat Selengkapnya',
    popupButtonUrl: settings.popupButtonUrl || '',
    popupFrequency: settings.popupFrequency || 'once_per_session'
  });
});

// 0.15 GET /api/v1/popup - Dedicated Public Pop-up Promo / Announcement Endpoint
router.get('/popup', (req, res) => {
  const settings = db.getSettings();
  res.json({
    success: true,
    popupEnabled: Boolean(settings.popupEnabled),
    popupTitle: settings.popupTitle || '',
    popupMessage: settings.popupMessage || '',
    popupImageUrl: settings.popupImageUrl || '',
    popupButtonText: settings.popupButtonText || 'Lihat Selengkapnya',
    popupButtonUrl: settings.popupButtonUrl || '',
    popupFrequency: settings.popupFrequency || 'once_per_session'
  });
});

// 0.2 POST /api/v1/auth/verify-password - Verify visitor access password
router.post('/auth/verify-password', (req, res) => {
  const { password } = req.body;
  const settings = db.getSettings();

  if (!settings.isPasswordProtected) {
    return res.json({
      success: true,
      authorized: true,
      message: 'Proteksi sandi sedang dinonaktifkan.'
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      authorized: false,
      error: 'Kata sandi akses harus diisi.'
    });
  }

  if (String(password).trim() === String(settings.accessPassword).trim()) {
    return res.json({
      success: true,
      authorized: true,
      token: nanoid(32),
      message: 'Akses berhasil diverifikasi.'
    });
  }

  return res.status(401).json({
    success: false,
    authorized: false,
    error: 'Kata sandi akses salah! Silakan coba lagi.'
  });
});

// 0.25 POST /api/v1/settings/verify-pin - Verify PIN to access Settings menu
router.post('/settings/verify-pin', (req, res) => {
  const { pin } = req.body;
  const currentSettings = db.getSettings();
  const validPin = String(currentSettings.settingsPassword || currentSettings.adminBotPassword || '2103').trim();

  if (!pin) {
    return res.status(400).json({
      success: false,
      authorized: false,
      error: 'PIN Pengaturan harus diisi.'
    });
  }

  if (String(pin).trim() === validPin) {
    return res.json({
      success: true,
      authorized: true,
      message: 'PIN Pengaturan Valid! Akses pengaturan dibuka.'
    });
  }

  return res.status(401).json({
    success: false,
    authorized: false,
    error: 'PIN Pengaturan salah! Silakan masukkan PIN yang benar.'
  });
});

// 0.3 GET /api/v1/settings - Get settings
router.get('/settings', (req, res) => {
  const settings = db.getSettings();
  res.json({
    success: true,
    settings: {
      apiKey: settings.apiKey,
      apiMode: settings.apiMode,
      webhookMode: settings.webhookMode,
      httpDocsMode: settings.httpDocsMode,
      isPasswordProtected: settings.isPasswordProtected,
      accessPassword: settings.accessPassword,
      settingsPassword: settings.settingsPassword,
      adminBotPassword: settings.adminBotPassword,
      webhookSecret: settings.webhookSecret,
      retentionHours: settings.retentionHours,
      popupEnabled: settings.popupEnabled,
      popupTitle: settings.popupTitle,
      popupMessage: settings.popupMessage,
      popupImageUrl: settings.popupImageUrl,
      popupButtonText: settings.popupButtonText,
      popupButtonUrl: settings.popupButtonUrl,
      popupFrequency: settings.popupFrequency
    }
  });
});

// 0.4 POST /api/v1/settings - Update settings
router.post('/settings', (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json({
    success: true,
    message: 'Pengaturan berhasil diperbarui dan disimpan.',
    settings: updated
  });
});

// 0.5 GET & POST /api/v1/key/verify - Verify API Key
const handleKeyVerify = (req, res) => {
  const key = req.apiKey || req.query.key || req.query.api_key || req.body?.key || req.body?.api_key;
  if (!key) {
    return res.status(400).json({
      success: false,
      error: 'Parameter key atau header X-API-Key diperlukan.'
    });
  }

  const currentSettings = db.getSettings();
  const validKeys = [currentSettings.apiKey, ...config.apiKeys].filter(Boolean).map(k => k.toUpperCase());
  const isValid = validKeys.includes(key.toUpperCase());

  if (isValid) {
    res.json({
      success: true,
      valid: true,
      key: key.toUpperCase(),
      tier: 'UNLIMITED_VIP',
      status: 'ACTIVE',
      message: 'API Key Valid! Akses penuh tanpa batasan kuota diaktifkan.',
      features: [
        'Akses seluruh endpoint REST API',
        'Real-time Server-Sent Events (SSE) stream',
        'Retensi pesan 24 jam',
        'Multi-domain support'
      ]
    });
  } else {
    res.status(401).json({
      success: false,
      valid: false,
      error: `API Key '${key}' tidak valid.`
    });
  }
};
router.get('/key/verify', handleKeyVerify);
router.post('/key/verify', handleKeyVerify);

// 1. GET /api/v1/domains - List available active domains (Pure VPS data)
router.get('/domains', (req, res) => {
  const domains = db.getDomains();
  res.json({
    success: true,
    total: domains.length,
    domains
  });
});

// 2. POST /api/v1/domains - Add a custom domain
const handleAddDomain = (req, res) => {
  const domain = req.body?.domain || req.query?.domain || req.body?.name;
  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ success: false, error: 'Domain name is required' });
  }

  const clean = domain.trim().toLowerCase().replace(/^(https?:\/\/)/, '').replace(/\/$/, '');
  if (!clean.includes('.') || clean.length < 3) {
    return res.status(400).json({ success: false, error: 'Invalid domain format' });
  }

  db.addDomain(clean);
  res.json({
    success: true,
    message: `Domain ${clean} successfully added`,
    domains: db.getDomains()
  });
};
router.post('/domains', handleAddDomain);
router.post('/domain/add', handleAddDomain);

// 3. DELETE /api/v1/domains/:domain - Remove a custom domain
router.delete('/domains/:domain', (req, res) => {
  const domain = req.params.domain.toLowerCase().trim();
  const removed = db.removeDomain(domain);
  if (!removed) {
    return res.status(404).json({ success: false, error: 'Domain not found' });
  }
  res.json({
    success: true,
    message: `Domain ${domain} removed`,
    domains: db.getDomains()
  });
});

// 4. GET & POST /api/v1/inbox/generate - Generate random email address
const handleGenerateInbox = (req, res) => {
  const domains = db.getDomains();
  const requestedDomain = req.query?.domain || req.body?.domain;

  let domain = domains[0] || 'mailflatimo.web.id';
  if (requestedDomain) {
    const cleanDomain = requestedDomain.toLowerCase().trim();
    if (domains.includes(cleanDomain)) {
      domain = cleanDomain;
    }
  }

  const username = generateRandomUsername();
  const email = `${username}@${domain}`;
  const inbox = db.getOrCreateInbox(email);

  res.json({
    success: true,
    email: inbox.email,
    username,
    domain,
    createdAt: inbox.createdAt
  });
};
router.get('/inbox/generate', handleGenerateInbox);
router.post('/inbox/generate', handleGenerateInbox);
router.get('/generate', handleGenerateInbox);
router.post('/generate', handleGenerateInbox);

// 5. POST & GET /api/v1/inbox/create - Create custom/specific inbox
const handleCreateInbox = (req, res) => {
  let username = req.body?.username || req.query?.username || req.body?.name || req.query?.name;
  let domain = req.body?.domain || req.query?.domain;
  const fullEmail = req.body?.email || req.query?.email;

  if (fullEmail && fullEmail.includes('@')) {
    const parts = fullEmail.toLowerCase().trim().split('@');
    username = parts[0];
    domain = parts[1];
  }

  if (!username) {
    username = generateRandomUsername();
  }

  const domains = db.getDomains();
  let selectedDomain = (domain || domains[0] || 'mailflatimo.web.id').toLowerCase().trim();

  if (!domains.includes(selectedDomain)) {
    selectedDomain = domains[0] || 'mailflatimo.web.id';
  }

  const cleanUser = username.toLowerCase().trim().replace(/[^a-z0-9._-]/g, '') || generateRandomUsername();
  const email = `${cleanUser}@${selectedDomain}`;
  const inbox = db.getOrCreateInbox(email);

  res.json({
    success: true,
    email: inbox.email,
    username: cleanUser,
    domain: selectedDomain,
    createdAt: inbox.createdAt
  });
};
router.post('/inbox/create', handleCreateInbox);
router.get('/inbox/create', handleCreateInbox);
router.post('/create', handleCreateInbox);
router.get('/create', handleCreateInbox);

// 5.1 Mail.tm & Temp-mail Compatibility (POST /accounts, POST /token, POST /custom)
router.post('/accounts', (req, res) => {
  const address = req.body?.address || req.body?.email || `${generateRandomUsername()}@${db.getDomains()[0] || 'mailflatimo.web.id'}`;
  const inbox = db.getOrCreateInbox(address);
  res.status(201).json({
    id: inbox.email,
    address: inbox.email,
    quota: 50000000,
    used: 0,
    isDisabled: false,
    isDeleted: false,
    createdAt: inbox.createdAt,
    updatedAt: inbox.createdAt
  });
});

router.post('/token', (req, res) => {
  const address = req.body?.address || req.body?.email || req.body?.username || 'user';
  res.json({
    token: `token_${Buffer.from(address).toString('base64')}`,
    id: address
  });
});

router.post('/custom', handleCreateInbox);

// 6. GET /api/v1/inbox/:email/messages & Universal 3rd-party Bot aliases
const handleGetInboxMessages = (req, res) => {
  // 1secmail compatibility check
  if (req.query.action === 'readMessage' && (req.query.id || req.params.id)) {
    const id = req.query.id || req.params.id;
    const msg = db.getMessageById(id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    return res.json({
      id: msg.id,
      from: msg.from?.address || msg.from?.text || 'Unknown',
      subject: msg.subject,
      date: msg.date,
      body: msg.text || msg.html || '',
      textBody: msg.text || '',
      htmlBody: msg.html || '',
      otp: msg.otp || msg.code || '',
      code: msg.otp || msg.code || '',
      verification_code: msg.otp || '',
      verification_link: msg.verification_link || '',
      attachments: msg.attachments || []
    });
  }

  let email = '';

  if (req.params.username && req.params.domain) {
    email = `${req.params.username}@${req.params.domain}`.toLowerCase().trim();
  } else if (req.query.login && req.query.domain) {
    email = `${req.query.login}@${req.query.domain}`.toLowerCase().trim();
  } else {
    email = (req.params.email || req.params.id || req.query.email || req.query.inbox || req.query.to || req.body?.email || req.body?.address || req.body?.to || '').toLowerCase().trim();
  }

  if (email && !email.includes('@')) {
    const defaultDomain = db.getDomains()[0] || 'mailflatimo.web.id';
    email = `${email}@${defaultDomain}`;
  }

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email parameter is required' });
  }

  const messages = db.getMessages(email);
  const unreadCount = messages.filter(m => !m.read).length;

  // If 1secmail style is requested (query action=getMessages) or requested raw array:
  if (req.query.action === 'getMessages') {
    const secMailFormat = messages.map(m => ({
      id: m.id,
      from: m.from?.address || m.from?.text || 'Unknown',
      subject: m.subject || '(Tanpa Subjek)',
      date: m.date,
      otp: m.otp || '',
      code: m.otp || '',
      verification_code: m.otp || '',
      verification_link: m.verification_link || ''
    }));
    return res.json(secMailFormat);
  }

  res.json({
    success: true,
    email,
    total: messages.length,
    unread: unreadCount,
    messages
  });
};

router.get('/inbox/:email/messages', handleGetInboxMessages);
router.get('/inbox/:email', handleGetInboxMessages);
router.get('/inbox/:username/:domain', handleGetInboxMessages);
router.get('/mailbox/:email', handleGetInboxMessages);
router.get('/mailbox/:username/:domain', handleGetInboxMessages);
router.get('/messages/:username/:domain', handleGetInboxMessages);
router.get('/emails/:username/:domain', handleGetInboxMessages);
router.get('/messages', handleGetInboxMessages);
router.get('/emails', handleGetInboxMessages);

// 7. DELETE /api/v1/inbox/:email - Clear all messages in inbox
router.delete('/inbox/:email', (req, res) => {
  const email = req.params.email.toLowerCase().trim();
  db.deleteInbox(email);

  res.json({
    success: true,
    message: `Inbox ${email} and all its messages have been purged.`
  });
});

// 8. GET /api/v1/messages/:id - Get full message detail
const handleGetMessageDetail = (req, res) => {
  const param = req.params.id;
  // If param contains '@', it is an email address inquiry (e.g. /messages/user@domain.com)!
  if (param && param.includes('@')) {
    return handleGetInboxMessages(req, res);
  }

  const msg = db.getMessageById(param);
  if (!msg) {
    return res.status(404).json({ success: false, error: 'Message not found or expired' });
  }

  res.json({
    success: true,
    message: msg,
    ...msg
  });
};
router.get('/messages/:id', handleGetMessageDetail);
router.get('/message/:id', handleGetMessageDetail);

// 9. DELETE /api/v1/messages/:id - Delete single message
router.delete('/messages/:id', (req, res) => {
  const msg = db.messages.get(req.params.id);
  if (!msg) {
    return res.status(404).json({ success: false, error: 'Message not found' });
  }

  const inboxEmail = msg.inboxEmail;
  db.deleteMessage(req.params.id);
  eventBus.notifyDeletedMail(inboxEmail, req.params.id);

  res.json({
    success: true,
    message: 'Message deleted successfully'
  });
});

// 10. GET /api/v1/messages/:id/raw - Download raw EML format
router.get('/messages/:id/raw', (req, res) => {
  const msg = db.getMessageById(req.params.id);
  if (!msg) {
    return res.status(404).send('Message not found');
  }

  const emlContent = [
    `From: ${msg.from.name ? `"${msg.from.name}" <${msg.from.address}>` : msg.from.address || msg.from.text}`,
    `To: <${msg.inboxEmail}>`,
    `Subject: ${msg.subject}`,
    `Date: ${new Date(msg.date).toUTCString()}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    '',
    msg.html || msg.text || ''
  ].join('\r\n');

  res.setHeader('Content-Type', 'message/rfc822');
  res.setHeader('Content-Disposition', `attachment; filename="mail-${msg.id}.eml"`);
  res.send(emlContent);
});

// 11. GET /api/v1/messages/:id/attachments/:attachmentId - Download attachment
router.get('/messages/:id/attachments/:attachmentId', (req, res) => {
  const msg = db.getMessageById(req.params.id);
  if (!msg) {
    return res.status(404).send('Message not found');
  }

  const att = (msg.attachments || []).find(a => a.id === req.params.attachmentId);
  if (!att || !att.dataBase64) {
    return res.status(404).send('Attachment not found');
  }

  const buffer = Buffer.from(att.dataBase64, 'base64');
  res.setHeader('Content-Type', att.contentType || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(att.filename)}"`);
  res.setHeader('Content-Length', buffer.length);
  res.send(buffer);
});

// 12. POST /api/v1/test-email - Mock test email sender
router.post('/test-email', (req, res) => {
  const { to, senderName, senderEmail, subject, text, html } = req.body;

  if (!to || !to.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid "to" email address is required' });
  }

  const recipient = to.toLowerCase().trim();
  const mockSubject = subject || 'Kode Verifikasi Akun Flatimo Mail';
  const mockFrom = {
    name: senderName || 'Flatimo Security Team',
    address: senderEmail || 'security@flatimo.me',
    text: `"${senderName || 'Flatimo Security Team'}" <${senderEmail || 'security@flatimo.me'}>`
  };

  const sampleOtp = Math.floor(100000 + Math.random() * 900000);
  const mockHtml = html || `
    <div style="background-color: #0b0c12; color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #ffb80040;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 28px; font-weight: 800; color: #ffb800;">Flatimo Mail</span>
      </div>
      <h2 style="color: #ffffff; font-size: 20px; margin-bottom: 12px;">Permintaan Kode Verifikasi Masuk</h2>
      <p style="color: #94a3b8; line-height: 1.6; margin-bottom: 20px;">
        Halo! Anda menerima pesan ini sebagai pengujian kecepatan penerimaan email di <strong>Flatimo Mail</strong>.
      </p>
      <div style="background: linear-gradient(135deg, rgba(255,184,0,0.15), rgba(255,87,34,0.15)); border: 1px dashed #ffb800; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <div style="color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">Kode Verifikasi Rahasia:</div>
        <div style="color: #ffb800; font-size: 36px; font-weight: 800; letter-spacing: 6px; font-family: monospace;">${sampleOtp}</div>
      </div>
      <p style="color: #64748b; font-size: 13px; margin-bottom: 0;">
        Pesan ini dikirim secara instan ke inbox <code>${recipient}</code>. Pesan akan dihapus otomatis setelah 24 jam.
      </p>
    </div>
  `;

  const msgData = {
    id: nanoid(12),
    inboxEmail: recipient,
    from: mockFrom,
    to: [{ text: recipient, address: recipient }],
    subject: mockSubject,
    text: text || `Kode verifikasi Anda adalah: ${sampleOtp}. Pesan dikirimkan ke ${recipient}.`,
    html: mockHtml,
    textAsHtml: mockHtml,
    date: new Date().toISOString(),
    headers: { 'x-mailer': 'Flatimo Test Engine v1.0' },
    attachments: [],
    size: 2048
  };

  const saved = db.saveMessage(msgData);
  eventBus.notifyNewMail(recipient, saved);

  res.json({
    success: true,
    message: 'Test email generated and dispatched instantly',
    email: saved
  });
});

// 13. GET /api/v1/stats - Server Statistics
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    stats: db.getStats()
  });
});

export default router;
