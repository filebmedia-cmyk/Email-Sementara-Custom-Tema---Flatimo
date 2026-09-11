import { EventEmitter } from 'events';

class MailEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(200);
  }

  notifyNewMail(inboxEmail, message) {
    const normalized = inboxEmail.toLowerCase().trim();
    // Specific inbox listener
    this.emit(`mail:${normalized}`, message);
    // Global listener for dashboard stats
    this.emit('mail:any', { inbox: normalized, message });
  }

  notifyDeletedMail(inboxEmail, messageId) {
    const normalized = inboxEmail.toLowerCase().trim();
    this.emit(`delete:${normalized}`, messageId);
  }
}

export const eventBus = new MailEventBus();
