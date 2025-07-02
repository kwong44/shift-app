// src/utils/logger.js
// Central Winston logger configuration
// -------------------------------------------------------------
// We use this logger across the codebase to ensure consistent
// formatting and log levels.
// -------------------------------------------------------------

import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf, colorize } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    colorize(),
    timestamp(),
    logFormat
  ),
  transports: [new transports.Console()],
});

export default logger; 