import { SMTPServer } from 'smtp-server';
import { db } from './db.js';
import { config } from './config.js';
import { eventBus } from './eventBus.js';
import { parseRawEmail } from './utils/mailParser.js';

export function startSmtpServer() {
  const server = new SMTPServer({
    name: 'mail.flatimo.local',
    banner: '⚡ Flatimo Mail High-Speed SMTP Ingestion Engine',
    authOptional: true,
    disabledCommands: ['AUTH', 'STARTTLS'], // Inbound MX mail receiver
    size: config.maxAttachmentSizeMb * 1024 * 1024,
    
    // Accept RCPT TO: Auto-accept and auto-discover any domain routed via DNS to this server
    onRcptTo(address, session, callback) {
      const recipient = address.address.toLowerCase();
      const domain = recipient.split('@')[1];

      if (!domain || !domain.includes('.')) {
        return callback(new Error('Invalid email recipient address'));
      }

      // Auto-register domain if newly connected via DNS MX
      if (!db.isDomainAllowed(domain)) {
        db.addDomain(domain);
        console.log(`[SMTP] ⚡ Auto-Discovered new DNS domain: @${domain} (Added to active TMail domains)`);
      }

      callback(); // Accept recipient
    },

    // Process email data stream
    onData(stream, session, callback) {
      const chunks = [];
      stream.on('data', chunk => chunks.push(chunk));

      stream.on('end', async () => {
        try {
          const rawBuffer = Buffer.concat(chunks);
          const recipients = session.envelope.rcptTo.map(r => r.address.toLowerCase());

          // Parse the email payload
          const parsed = await parseRawEmail(rawBuffer, recipients[0]);

          // Save message for each recipient inbox
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
              console.log(`[SMTP] ⚡ Email received for <${rcpt}>: "${saved.subject}" from <${saved.from.address || saved.from.text}>`);
            }
          }

          callback(null, 'OK: Message delivered to Flatimo Mail');
        } catch (err) {
          console.error('[SMTP] Error processing incoming mail:', err);
          callback(new Error('Failed to process incoming email'));
        }
      });
    }
  });

  server.on('error', err => {
    console.error('[SMTP Engine Error]:', err.message);
  });

  server.listen(config.smtpPort, '0.0.0.0', () => {
    console.log(`⚡ [SMTP Engine] Listening for incoming emails on port ${config.smtpPort} (MX Priority 1 Ready)`);
  });

  return server;
}
