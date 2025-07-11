// @ts-nocheck
/* ---------------------------------------------------------------------------
 * Lightweight Winston-style logger for Supabase Edge Functions (Deno)
 * ---------------------------------------------------------------------------
 * Provides `debug | info | warn | error` methods mirroring Winston's API while
 * remaining dependency-free and Deno-compatible. Each log entry is ISO-dated
 * and prefixed with its level. The minimum level emitted is controlled via
 * the `LOG_LEVEL` environment variable. Default = 'info'.
 * ------------------------------------------------------------------------- */

// Map log levels to numeric priorities for easy comparison
const LEVEL_PRIORITY = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
} as const;

type LogLevel = keyof typeof LEVEL_PRIORITY;

// Resolve log level from environment (default to 'info')
const envLevel = (Deno.env.get('LOG_LEVEL') || 'info').toLowerCase() as LogLevel;

function shouldLog(level: LogLevel) {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[envLevel];
}

function formatMessage(level: LogLevel, message: string, meta?: unknown) {
  const ts = new Date().toISOString();
  const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} [${level.toUpperCase()}] ${message}${metaString}`;
}

const logger = {
  debug: (msg: string, meta?: unknown) => {
    if (shouldLog('debug')) console.debug(formatMessage('debug', msg, meta));
  },
  info: (msg: string, meta?: unknown) => {
    if (shouldLog('info')) console.info(formatMessage('info', msg, meta));
  },
  warn: (msg: string, meta?: unknown) => {
    if (shouldLog('warn')) console.warn(formatMessage('warn', msg, meta));
  },
  error: (msg: string, meta?: unknown) => {
    if (shouldLog('error')) console.error(formatMessage('error', msg, meta));
  },
} as const;

export default logger; 