import express from 'express';
import { eventBus } from '../eventBus.js';

const router = express.Router();

// Real-time SSE stream for a specific inbox
router.get('/inbox/:email/stream', (req, res) => {
  const email = (req.params.email || '').toLowerCase().trim();

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx proxy buffering
  res.flushHeaders();

  // Send initial connected event
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', email, timestamp: new Date().toISOString() })}\n\n`);

  // Listener for incoming mail
  const onNewMail = (message) => {
    res.write(`data: ${JSON.stringify({ type: 'NEW_MAIL', message })}\n\n`);
  };

  const onDeleteMail = (messageId) => {
    res.write(`data: ${JSON.stringify({ type: 'DELETE_MAIL', messageId })}\n\n`);
  };

  const mailEventName = `mail:${email}`;
  const deleteEventName = `delete:${email}`;

  eventBus.on(mailEventName, onNewMail);
  eventBus.on(deleteEventName, onDeleteMail);

  // Keep-alive heartbeat every 20 seconds
  const heartbeat = setInterval(() => {
    res.write(`: heartbeat ${Date.now()}\n\n`);
  }, 20000);

  // Cleanup on client disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    eventBus.removeListener(mailEventName, onNewMail);
    eventBus.removeListener(deleteEventName, onDeleteMail);
    res.end();
  });
});

export default router;
