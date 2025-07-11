// src/utils/logger.js
// Central Winston logger configuration
// -------------------------------------------------------------
// We use this logger across the codebase to ensure consistent
// formatting and log levels.
// -------------------------------------------------------------

// ---------------------------------------------------------------------------
// Lightweight Logger Utility (No External Dependencies)
// ---------------------------------------------------------------------------
// Winston is not available in the React-Native runtime (it depends on Node.js
// core modules such as `fs`). To keep the logging API consistent across the
// codebase *without* pulling in heavy dependencies, we expose a tiny wrapper
// around the native `console` methods. This prevents Metro bundler errors while
// still giving us level-based logging.
//
// Design goals:
// 1. API-compatible with the subset of Winston we actually use (`debug`,
//    `info`, `warn`, `error`).
// 2. No runtime configuration required – log level is controlled via
//    `NODE_ENV` (production ⇒ `info`, otherwise `debug`).
// 3. Lightweight – zero external dependencies; safe in Expo/React-Native.
// ---------------------------------------------------------------------------

/* eslint-disable no-console */

// Determine the minimum level to emit based on environment.
const LEVEL_PRIORITY = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

// ---------------------------------------------------------------------------
// Determine current log level:
// 1. Respect explicit `EXPO_PUBLIC_LOG_LEVEL` (e.g. 'debug', 'info', 'warn', 'error').
// 2. Fallback to 'debug' by default. This prevents verbose "DEBUG" logs from
//    flooding the Metro console unless the developer *explicitly* opts-in by
//    setting the environment variable.
// ---------------------------------------------------------------------------

const envOverride = typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_LOG_LEVEL : null;

// ---------------------------------------------------------------------------
// DEVELOPMENT UPDATE (2025-07-11):
// Temporarily increase default verbosity to `debug` so we can capture more
// diagnostic information while investigating the AI-Coach rate-limit issue.
// This will still respect any explicit `EXPO_PUBLIC_LOG_LEVEL` env override so
// production builds can force a quieter level (e.g. 'info').
// ---------------------------------------------------------------------------

const currentLevel = envOverride || 'debug';

function shouldLog(level) {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel];
}

function formatMessage(level, message, meta) {
  const ts = new Date().toISOString();
  const metaString = meta && Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} [${level.toUpperCase()}] ${message}${metaString}`;
}

const logger = {
  debug: (msg, meta = {}) => {
    if (shouldLog('debug')) console.debug(formatMessage('debug', msg, meta));
  },
  info: (msg, meta = {}) => {
    if (shouldLog('info')) console.info(formatMessage('info', msg, meta));
  },
  warn: (msg, meta = {}) => {
    if (shouldLog('warn')) console.warn(formatMessage('warn', msg, meta));
  },
  error: (msg, meta = {}) => {
    if (shouldLog('error')) console.error(formatMessage('error', msg, meta));
  },
};

// ---------------------------------------------------------------------------
// Monkey-patch `console.debug` so that *all* direct `console.debug` calls in the
// codebase respect the log-level filtering implemented above. This allows us to
// keep existing debug statements around for future troubleshooting *without*
// cluttering the console for everyday development and production use.
// ---------------------------------------------------------------------------

if (!console.__patchedForLogLevel) {
  /* eslint-disable no-console */
  const originalDebug = console.debug.bind(console);

  console.debug = (...args) => {
    if (shouldLog('debug')) {
      // Pass through unchanged to preserve original formatting.
      originalDebug(...args);
    }
  };

  // Flag to avoid double-patching in case logger.js gets imported multiple times.
  console.__patchedForLogLevel = true;
}

export default logger; 