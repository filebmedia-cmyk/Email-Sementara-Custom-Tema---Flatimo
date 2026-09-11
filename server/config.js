import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  smtpPort: parseInt(process.env.SMTP_PORT || '25', 10),
  env: process.env.NODE_ENV || 'development',
  defaultDomains: (process.env.DOMAINS || 'mailflatimo.web.id,flatimostore.my.id,flatimo.me')
    .split(',')
    .map(d => d.trim().toLowerCase())
    .filter(Boolean),
  retentionHours: parseInt(process.env.RETENTION_HOURS || '24', 10),
  maxAttachmentSizeMb: parseInt(process.env.MAX_ATTACHMENT_SIZE_MB || '15', 10),
  webhookSecret: process.env.WEBHOOK_SECRET || '',
  apiKey: process.env.API_KEY || 'FLATIMOSTORE',
  apiKeys: (process.env.API_KEYS || 'FLATIMOSTORE').split(',').map(k => k.trim()),
  dataDir: process.env.DATA_DIR || (process.env.VERCEL ? '/tmp/data' : path.join(__dirname, '..', 'data')),
  upstashRedisUrl: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '',
  upstashRedisToken: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '',
};
