// Minimal structured logger. Swap for pino/winston later if needed.
const timestamp = () => new Date().toISOString();

export const logger = {
  info: (msg, meta = {}) => console.log(`[INFO] ${timestamp()} - ${msg}`, meta),
  error: (msg, meta = {}) => console.error(`[ERROR] ${timestamp()} - ${msg}`, meta),
  warn: (msg, meta = {}) => console.warn(`[WARN] ${timestamp()} - ${msg}`, meta),
};
