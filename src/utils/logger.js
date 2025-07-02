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

// Allow developers to override the log level via an environment variable.
// `EXPO_PUBLIC_LOG_LEVEL` is exposed to the JS bundle during Expo build.
// Fallback order:
//   1. Explicit env override
//   2. __DEV__ (bundler flag) ⇒ 'debug'
//   3. production ⇒ 'info'

const envOverride = typeof process !== 'undefined' ? process.env.EXPO_PUBLIC_LOG_LEVEL : null;
const currentLevel = envOverride || (__DEV__ ? 'debug' : 'info');

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

export default logger; 