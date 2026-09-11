import { db } from '../db.js';
import { config } from '../config.js';

export function startAutoCleaner() {
  console.log(`[Cleaner] Auto-retention cleaner started. Purging emails older than ${config.retentionHours} hours.`);
  
  // Initial run
  db.cleanupExpired(config.retentionHours);

  // Run every 10 minutes
  const interval = setInterval(() => {
    try {
      db.cleanupExpired(config.retentionHours);
    } catch (err) {
      console.error('[Cleaner] Error in cleanup task:', err.message);
    }
  }, 10 * 60 * 1000);

  return interval;
}
