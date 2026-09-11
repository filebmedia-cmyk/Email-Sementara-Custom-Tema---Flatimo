import express from 'express';
import { db } from '../db.js';
import { eventBus } from '../eventBus.js';
import { parseRawEmail } from '../utils/mailParser.js';
import { config } from '../config.js';

const router = express.Router();

// Middleware to parse raw text/MIME if Content-Type is text/plain or message/rfc822
router.use(express.text({ type: ['text/*', 'message/*'], limit: `${config.maxAttachmentSizeMb}mb` }));
router.use(express.json({ limit: `${config.maxAttachmentSizeMb}mb` }));

// Inbound Email Webhook
// Compatible with Cloudflare Workers, SendGrid, Mailgun, and custom HTTP forwarders
router.post('/incoming', async (req, res) => {
  try {
    const currentSettings = db.getSettings();

    // Check if Webhook is in Private Mode
    if (currentSettings.webhookMode === 'private') {
      const expectedSecret = currentSettings.webhookSecret || config.webhookSecret;
      const providedSecret = req.headers['x-webhook-secret'] || req.query.secret;
      
      if (!providedSecret || providedSecret !== expectedSecret) {
        return res.status(401).json({ 
          success: false, 
          error: 'Akses Ditolak: Inbound Webhook diset ke mode Privat. Harap sertakan header X-Webhook-Secret yang valid.' 
        });
      }
    }

    let rawEmail = null;
    let fallbackRecipient = req.query.to || req.headers['x-forwarded-to'];

    // 1. If payload is raw MIME string / buffer
    if (typeof req.body === 'string' && req.body.length > 0) {
      rawEmail = req.body;
    }
    // 2. If payload is JSON (e.g. from Cloudflare Worker)
    else if (typeof req.body === 'object' && req.body !== null) {
      if (req.body.raw) {
        rawEmail = req.body.raw;
      } else if (req.body.mime) {
        rawEmail = req.body.mime;
      } else if (req.body.to && (req.body.html || req.body.text)) {
        // Pre-parsed JSON payload
        const recipient = (req.body.to || '').toLowerCase().trim();
        const domain = recipient.split('@')[1];

        if (!db.isDomainAllowed(domain)) {
          db.addDomain(domain);
        }

        const msgData = {
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          inboxEmail: recipient,
          from: req.body.from || { text: 'Unknown Sender', address: 'unknown@example.com' },
          to: [{ text: recipient, address: recipient }],
          subject: req.body.subject || '(Tanpa Subjek)',
          text: req.body.text || '',
          html: req.body.html || '',
          textAsHtml: req.body.html || req.body.text || '',
          date: req.body.date || new Date().toISOString(),
          headers: req.body.headers || {},
          attachments: req.body.attachments || [],
          size: JSON.stringify(req.body).length
        };

        const saved = db.saveMessage(msgData);
        eventBus.notifyNewMail(recipient, saved);

        return res.json({ success: true, message: 'Message received via JSON webhook', id: saved.id });
      }
    }

    if (!rawEmail) {
      return res.status(400).json({ success: false, error: 'No readable email payload found in request' });
    }

    // Parse raw MIME
    const parsed = await parseRawEmail(rawEmail, fallbackRecipient);
    const recipients = parsed.toRecipients;

    if (recipients.length === 0) {
      return res.status(400).json({ success: false, error: 'Could not determine recipient email address' });
    }

    const savedMessages = [];

    for (const rcpt of recipients) {
      const domain = rcpt.split('@')[1];
      if (domain) {
        if (!db.isDomainAllowed(domain)) {
          db.addDomain(domain);
        }
        const msgData = {
          ...parsed,
          inboxEmail: rcpt,
          id: `${parsed.id}_${Math.random().toString(36).substring(2, 6)}`
        };

        const saved = db.saveMessage(msgData);
        eventBus.notifyNewMail(rcpt, saved);
        savedMessages.push(saved);
      }
    }

    res.json({
      success: true,
      message: `Processed email for ${savedMessages.length} recipients`,
      recipients: savedMessages.map(m => m.inboxEmail)
    });
  } catch (err) {
    console.error('[Webhook] Inbound processing error:', err);
    res.status(500).json({ success: false, error: 'Internal error processing webhook' });
  }
});

export default router;
