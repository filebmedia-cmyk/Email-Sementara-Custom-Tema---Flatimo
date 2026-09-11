import fs from 'fs';
import path from 'path';
import { config } from './config.js';

// Pastikan direktori data ada secara aman
try {
  if (!fs.existsSync(config.dataDir)) {
    fs.mkdirSync(config.dataDir, { recursive: true });
  }
} catch (e) {
  // Read-only or ephemeral environment fallback
}

const dbFilePath = path.join(config.dataDir, 'flatimo_mail.json');

// Helper Upstash Redis REST
async function upstashGet(key) {
  if (!config.upstashRedisUrl || !config.upstashRedisToken) return null;
  try {
    const res = await fetch(`${config.upstashRedisUrl}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${config.upstashRedisToken}` }
    });
    const data = await res.json();
    return data.result ? JSON.parse(data.result) : null;
  } catch (e) {
    return null;
  }
}

async function upstashSet(key, value) {
  if (!config.upstashRedisUrl || !config.upstashRedisToken) return false;
  try {
    await fetch(`${config.upstashRedisUrl}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${config.upstashRedisToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(JSON.stringify(value))
    });
    return true;
  } catch (e) {
    return false;
  }
}

// In-Memory Database Store dengan Auto-Persist ke Disk & Cloud KV / Redis
class DatabaseStore {
  constructor() {
    this.domains = new Set(config.defaultDomains);
    this.inboxes = new Map(); // email -> { email, createdAt, lastActivity }
    this.messages = new Map(); // id -> messageObj
    this.inboxIndex = new Map(); // email -> Set of messageIds
    this.settings = {
      apiKey: config.apiKey || 'FLATIMOSTORE',
      apiMode: 'public', // 'public' | 'private'
      webhookMode: 'public', // 'public' | 'private'
      httpDocsMode: 'public', // 'public' | 'private'
      isPasswordProtected: false, // Default OFF as requested
      accessPassword: 'flatimo_access_pass',
      settingsPassword: '2103', // Default settings PIN 2103 as requested
      adminBotPassword: '2103', // Default admin PIN for Telegram Bot as requested
      webhookSecret: config.webhookSecret || 'flatimo_secret_key_123',
      retentionHours: config.retentionHours || 24,
      popupEnabled: false,
      popupTitle: '',
      popupMessage: '',
      popupImageUrl: '',
      popupButtonText: 'Lihat Selengkapnya',
      popupButtonUrl: '',
      popupFrequency: 'once_per_session'
    };
    this.stats = {
      totalReceived: 0,
      totalAttachments: 0,
      startedAt: new Date().toISOString()
    };
    this._initPromise = this.load();
  }

  async ready() {
    if (config.upstashRedisUrl && config.upstashRedisToken) {
      await this.load();
    } else {
      await this._initPromise;
    }
    return this;
  }

  async load() {
    try {
      let data = null;

      // 1. Try loading from Upstash Redis if configured
      if (config.upstashRedisUrl && config.upstashRedisToken) {
        data = await upstashGet('flatimo_mail_db');
      }

      // 2. Fallback to local file if available
      if (!data && fs.existsSync(dbFilePath)) {
        const raw = fs.readFileSync(dbFilePath, 'utf8');
        data = JSON.parse(raw);
      }

      if (data) {
        if (data.domains && Array.isArray(data.domains)) {
          data.domains.forEach(d => this.domains.add(d.toLowerCase()));
        }
        if (data.inboxes && Array.isArray(data.inboxes)) {
          data.inboxes.forEach(inbox => {
            this.inboxes.set(inbox.email.toLowerCase(), inbox);
          });
        }
        if (data.messages && Array.isArray(data.messages)) {
          data.messages.forEach(msg => {
            this.messages.set(msg.id, msg);
            const email = msg.inboxEmail.toLowerCase();
            if (!this.inboxIndex.has(email)) {
              this.inboxIndex.set(email, new Set());
            }
            this.inboxIndex.get(email).add(msg.id);
          });
        }
        if (data.settings) {
          this.settings = { ...this.settings, ...data.settings };
        }
        if (data.stats) {
          this.stats = { ...this.stats, ...data.stats };
        }
      } else {
        this.save();
      }
    } catch (err) {
      console.error('[DB] Error loading database:', err.message);
    }
  }

  async saveAsync() {
    try {
      const data = {
        domains: Array.from(this.domains),
        inboxes: Array.from(this.inboxes.values()),
        messages: Array.from(this.messages.values()),
        settings: this.settings,
        stats: this.stats,
        lastSaved: new Date().toISOString()
      };

      try {
        fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
      } catch (e) {}

      if (config.upstashRedisUrl && config.upstashRedisToken) {
        await upstashSet('flatimo_mail_db', data);
      }
    } catch (err) {
      console.error('[DB] Error persisting database:', err.message);
    }
  }

  save() {
    this.saveAsync().catch(() => {});
  }


  // Settings Management
  getSettings() {
    return {
      apiKey: this.settings.apiKey || 'FLATIMOSTORE',
      apiMode: this.settings.apiMode || 'public',
      webhookMode: this.settings.webhookMode || 'public',
      httpDocsMode: this.settings.httpDocsMode || 'public',
      isPasswordProtected: Boolean(this.settings.isPasswordProtected),
      accessPassword: this.settings.accessPassword || 'flatimo_access_pass',
      settingsPassword: this.settings.settingsPassword || this.settings.adminBotPassword || '2103',
      adminBotPassword: this.settings.adminBotPassword || this.settings.settingsPassword || '2103',
      webhookSecret: this.settings.webhookSecret || 'flatimo_secret_key_123',
      retentionHours: this.settings.retentionHours || 24,
      popupEnabled: Boolean(this.settings.popupEnabled),
      popupTitle: this.settings.popupTitle || '',
      popupMessage: this.settings.popupMessage || '',
      popupImageUrl: this.settings.popupImageUrl || '',
      popupButtonText: this.settings.popupButtonText || 'Lihat Selengkapnya',
      popupButtonUrl: this.settings.popupButtonUrl || '',
      popupFrequency: this.settings.popupFrequency || 'once_per_session'
    };
  }

  getPublicSettings() {
    return {
      apiMode: this.settings.apiMode || 'public',
      webhookMode: this.settings.webhookMode || 'public',
      httpDocsMode: this.settings.httpDocsMode || 'public',
      isPasswordProtected: Boolean(this.settings.isPasswordProtected),
      retentionHours: this.settings.retentionHours || 24,
      popupEnabled: Boolean(this.settings.popupEnabled),
      popupTitle: this.settings.popupTitle || '',
      popupMessage: this.settings.popupMessage || '',
      popupImageUrl: this.settings.popupImageUrl || '',
      popupButtonText: this.settings.popupButtonText || 'Lihat Selengkapnya',
      popupButtonUrl: this.settings.popupButtonUrl || '',
      popupFrequency: this.settings.popupFrequency || 'once_per_session'
    };
  }

  updateSettings(newSettings) {
    if (newSettings && typeof newSettings === 'object') {
      if (newSettings.apiKey !== undefined) this.settings.apiKey = String(newSettings.apiKey).trim();
      if (newSettings.apiMode !== undefined) this.settings.apiMode = newSettings.apiMode === 'private' ? 'private' : 'public';
      if (newSettings.webhookMode !== undefined) this.settings.webhookMode = newSettings.webhookMode === 'private' ? 'private' : 'public';
      if (newSettings.httpDocsMode !== undefined) this.settings.httpDocsMode = newSettings.httpDocsMode === 'private' ? 'private' : 'public';
      if (newSettings.isPasswordProtected !== undefined) this.settings.isPasswordProtected = Boolean(newSettings.isPasswordProtected);
      if (newSettings.accessPassword !== undefined) this.settings.accessPassword = String(newSettings.accessPassword).trim();
      if (newSettings.settingsPassword !== undefined) {
        this.settings.settingsPassword = String(newSettings.settingsPassword).trim();
        this.settings.adminBotPassword = this.settings.settingsPassword;
      }
      if (newSettings.adminBotPassword !== undefined) {
        this.settings.adminBotPassword = String(newSettings.adminBotPassword).trim();
        this.settings.settingsPassword = this.settings.adminBotPassword;
      }
      if (newSettings.webhookSecret !== undefined) this.settings.webhookSecret = String(newSettings.webhookSecret).trim();
      if (newSettings.retentionHours !== undefined) this.settings.retentionHours = Number(newSettings.retentionHours) || 24;
      if (newSettings.popupEnabled !== undefined) this.settings.popupEnabled = Boolean(newSettings.popupEnabled);
      if (newSettings.popupTitle !== undefined) this.settings.popupTitle = String(newSettings.popupTitle).trim();
      if (newSettings.popupMessage !== undefined) this.settings.popupMessage = String(newSettings.popupMessage).trim();
      if (newSettings.popupImageUrl !== undefined) this.settings.popupImageUrl = String(newSettings.popupImageUrl).trim();
      if (newSettings.popupButtonText !== undefined) this.settings.popupButtonText = String(newSettings.popupButtonText).trim();
      if (newSettings.popupButtonUrl !== undefined) this.settings.popupButtonUrl = String(newSettings.popupButtonUrl).trim();
      if (newSettings.popupFrequency !== undefined) this.settings.popupFrequency = newSettings.popupFrequency === 'always' ? 'always' : 'once_per_session';
      this.save();
    }
    return this.getSettings();
  }

  // Domain Management
  getDomains() {
    return Array.from(this.domains);
  }

  addDomain(domain) {
    const clean = domain.trim().toLowerCase();
    if (!clean) return false;
    this.domains.add(clean);
    this.save();
    return true;
  }

  removeDomain(domain) {
    const clean = domain.trim().toLowerCase();
    const removed = this.domains.delete(clean);
    if (removed) this.save();
    return removed;
  }

  isDomainAllowed(domain) {
    const clean = domain.trim().toLowerCase();
    return this.domains.has(clean);
  }

  // Inbox Management
  getOrCreateInbox(email) {
    const normalized = email.trim().toLowerCase();
    if (!this.inboxes.has(normalized)) {
      const inbox = {
        email: normalized,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };
      this.inboxes.set(normalized, inbox);
      if (!this.inboxIndex.has(normalized)) {
        this.inboxIndex.set(normalized, new Set());
      }
      this.save();
      return inbox;
    }
    const existing = this.inboxes.get(normalized);
    existing.lastActivity = new Date().toISOString();
    return existing;
  }

  deleteInbox(email) {
    const normalized = email.trim().toLowerCase();
    const messageIds = this.inboxIndex.get(normalized);
    if (messageIds) {
      for (const id of messageIds) {
        this.messages.delete(id);
      }
      this.inboxIndex.delete(normalized);
    }
    const existed = this.inboxes.delete(normalized);
    this.save();
    return existed;
  }

  // Message Operations
  saveMessage(msg) {
    const normalizedInbox = msg.inboxEmail.trim().toLowerCase();
    this.getOrCreateInbox(normalizedInbox);

    const fullMessage = {
      id: msg.id,
      inboxEmail: normalizedInbox,
      from: msg.from || { text: 'Unknown Sender', address: 'unknown@example.com' },
      to: msg.to || [{ text: normalizedInbox, address: normalizedInbox }],
      subject: msg.subject || '(Tanpa Subjek)',
      text: msg.text || '',
      html: msg.html || '',
      textAsHtml: msg.textAsHtml || '',
      date: msg.date || new Date().toISOString(),
      headers: msg.headers || {},
      attachments: msg.attachments || [],
      size: msg.size || 0,
      read: false,
      createdAt: new Date().toISOString()
    };

    this.messages.set(fullMessage.id, fullMessage);
    if (!this.inboxIndex.has(normalizedInbox)) {
      this.inboxIndex.set(normalizedInbox, new Set());
    }
    this.inboxIndex.get(normalizedInbox).add(fullMessage.id);

    this.stats.totalReceived += 1;
    if (fullMessage.attachments.length > 0) {
      this.stats.totalAttachments += fullMessage.attachments.length;
    }

    this.save();
    return fullMessage;
  }

  getMessages(email) {
    const normalized = email.trim().toLowerCase();
    const messageIds = this.inboxIndex.get(normalized);
    if (!messageIds || messageIds.size === 0) {
      return [];
    }

    const list = [];
    for (const id of messageIds) {
      const msg = this.messages.get(id);
      if (msg) {
        list.push({
          id: msg.id,
          inboxEmail: msg.inboxEmail,
          from: msg.from,
          subject: msg.subject,
          snippet: (msg.text || '').substring(0, 150).trim(),
          date: msg.date,
          read: msg.read,
          hasAttachments: msg.attachments && msg.attachments.length > 0,
          attachmentCount: (msg.attachments || []).length,
          size: msg.size,
          createdAt: msg.createdAt
        });
      }
    }

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getMessageById(id) {
    const msg = this.messages.get(id);
    if (msg) {
      msg.read = true;
      this.save();
    }
    return msg || null;
  }

  deleteMessage(id) {
    const msg = this.messages.get(id);
    if (!msg) return false;

    const email = msg.inboxEmail.toLowerCase();
    if (this.inboxIndex.has(email)) {
      this.inboxIndex.get(email).delete(id);
    }
    this.messages.delete(id);
    this.save();
    return true;
  }

  cleanupExpired(hours = 24) {
    const now = Date.now();
    const maxAgeMs = hours * 60 * 60 * 1000;
    let deletedCount = 0;

    for (const [id, msg] of this.messages.entries()) {
      const msgTime = new Date(msg.createdAt || msg.date).getTime();
      if (now - msgTime > maxAgeMs) {
        const email = msg.inboxEmail.toLowerCase();
        if (this.inboxIndex.has(email)) {
          this.inboxIndex.get(email).delete(id);
        }
        this.messages.delete(id);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`[Cleaner] Purged ${deletedCount} expired messages older than ${hours} hours.`);
      this.save();
    }
    return deletedCount;
  }

  getStats() {
    return {
      activeInboxes: this.inboxes.size,
      storedMessages: this.messages.size,
      totalReceived: this.stats.totalReceived,
      totalAttachments: this.stats.totalAttachments,
      activeDomains: this.domains.size,
      uptimeSeconds: Math.floor(process.uptime())
    };
  }
}

export const db = new DatabaseStore();
