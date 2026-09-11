import app from './app.js';
import { config } from './config.js';
import { startSmtpServer } from './smtp.js';
import { startAutoCleaner } from './utils/cleaner.js';
import { startTelegramBot } from './telegramBot.js';

// Start HTTP Server
const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`
  ⚡ =================================================== ⚡
       FLATIMO MAIL - HIGH PERFORMANCE TEMP MAIL ENGINE   
  ⚡ =================================================== ⚡
  🌐 Web UI & REST API : http://localhost:${config.port}
  📫 SMTP Mail Server   : Port ${config.smtpPort} (MX Priority 1)
  🚀 Environment        : ${config.env}
  📁 Active Domains     : ${config.defaultDomains.join(', ')}
  🕒 Retention Period   : ${config.retentionHours} Hours
  🤖 Telegram Bot       : Live Synced Active
  =======================================================
  `);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ [Error] Port ${config.port} sedang digunakan oleh proses lain.`);
    console.error(`💡 Solusi: Anda dapat mengubah PORT di file .env atau mematikan proses node lama terlebih dahulu.\n`);
  } else {
    console.error('[HTTP Server Error]:', err.message);
  }
  process.exit(1);
});

// Start Background Services (Standalone Mode)
try {
  startSmtpServer();
} catch (err) {
  console.error('[SMTP Engine Error]: Could not bind SMTP port:', err.message);
}

startAutoCleaner();

// Start Live Telegram Bot
try {
  startTelegramBot();
} catch (err) {
  console.error('[Telegram Bot Error]:', err.message);
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('[System] Gracefully shutting down...');
  server.close(() => {
    process.exit(0);
  });
});
