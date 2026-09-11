import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { db } from './db.js';
import apiRouter from './routes/api.js';
import streamRouter from './routes/stream.js';
import webhookRouter from './routes/webhook.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Global Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Webhook-Secret', 'X-Forwarded-To', 'X-API-Key', 'api-key']
}));

// Standard JSON parser (for regular API requests)
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure DB is ready & synced
app.use(async (req, res, next) => {
  try {
    await db.ready();
  } catch (e) {}
  next();
});

// Request Logger
app.use((req, res, next) => {
  if (!req.path.includes('/stream')) {
    console.log(`[HTTP] ${req.method} ${req.path}`);
  }
  next();
});


// Universal API Routes (/api/v1 and legacy /api compatibility for all bots)
app.use('/api/v1', apiRouter);
app.use('/api/v1', streamRouter);
app.use('/api/v1/webhook', webhookRouter);

app.use('/api', apiRouter);
app.use('/api', streamRouter);
app.use('/api/webhook', webhookRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Flatimo Mail Engine',
    time: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    platform: process.env.VERCEL ? 'vercel-serverless' : 'standalone'
  });
});

// Universal 3rd-Party Temp Mail Bot Root Aliases (1secmail, Mail.tm, CapCut, Telegram Bots)
app.use((req, res, next) => {
  const p = req.path;
  const isStaticFile = p.includes('.') && (
    p.endsWith('.js') || 
    p.endsWith('.css') || 
    p.endsWith('.svg') || 
    p.endsWith('.png') || 
    p.endsWith('.jpg') || 
    p.endsWith('.ico') || 
    p.endsWith('.json') || 
    p.endsWith('.map') || 
    p.endsWith('.woff') || 
    p.endsWith('.woff2')
  );
  
  // If this is a Web Browser page load (Accept: text/html), NEVER hijack to raw JSON API!
  // Always let express serve the SPA React frontend (index.html)
  const isBrowserHtmlRequest = req.headers.accept && req.headers.accept.includes('text/html') && !req.query.action;
  if (isBrowserHtmlRequest && !p.startsWith('/api')) {
    return next();
  }

  // 1. If 1secmail style root query: ?action=getMessages or ?action=genRandomMailbox
  if (req.query.action && !p.startsWith('/api')) {
    return apiRouter(req, res, next);
  }

  // 2. If Mail.tm style root: /accounts, /token, /custom, /domains, /messages, /emails, /inbox
  if (p === '/accounts' || p === '/token' || p === '/custom' || p === '/domains' || p === '/messages' || p === '/emails' || p === '/inbox') {
    return apiRouter(req, res, next);
  }

  // 3. If /mailbox/:user or /mailbox/:user/:domain
  if (p.startsWith('/mailbox/')) {
    const rawParam = p.replace('/mailbox/', '');
    if (rawParam.includes('/')) {
      const [u, d] = rawParam.split('/');
      req.url = `/inbox/${u}/${d}`;
    } else {
      req.url = `/inbox/${rawParam}`;
    }
    return apiRouter(req, res, next);
  }

  // 4. If /:username/:domain (e.g. /dumuva/kingcapcut.biz.id or /mahohi/kingcapcut.biz.id)
  const segments = p.split('/').filter(Boolean);
  if (segments.length === 2 && segments[1].includes('.') && !isStaticFile) {
    req.url = `/inbox/${segments[0]}/${segments[1]}`;
    return apiRouter(req, res, next);
  }

  // 5. If /:email (e.g. /dumuva@kingcapcut.biz.id)
  if (segments.length === 1 && segments[0].includes('@') && !isStaticFile) {
    req.url = `/inbox/${segments[0]}`;
    return apiRouter(req, res, next);
  }

  next();
});

// Static frontend serving (for Production build & standalone mode)
const clientDistPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
}

export default app;
