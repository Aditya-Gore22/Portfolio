/**
 * utils/logger.js
 * Lightweight structured logger – writes JSON lines to stdout/stderr.
 * No extra npm packages required.
 *
 * Each log line: { level, ts, msg, ...meta }
 */

const isDev = process.env.NODE_ENV !== 'production';

function formatLine(level, msg, meta = {}) {
  const entry = { level, ts: new Date().toISOString(), msg, ...meta };
  return JSON.stringify(entry);
}

const logger = {
  info(msg, meta = {}) {
    console.log(formatLine('INFO', msg, meta));
  },
  warn(msg, meta = {}) {
    console.warn(formatLine('WARN', msg, meta));
  },
  error(msg, meta = {}) {
    if (isDev && meta.stack) {
      console.error(formatLine('ERROR', msg, meta));
    } else {
      const { stack, ...safeMeta } = meta;
      console.error(formatLine('ERROR', msg, safeMeta));
    }
  },
  debug(msg, meta = {}) {
    if (isDev) {
      console.debug(formatLine('DEBUG', msg, meta));
    }
  },
};

export default logger;
