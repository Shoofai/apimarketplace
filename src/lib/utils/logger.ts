import pino from 'pino';

/**
 * Logger instance using Pino.
 * Configured for development (pretty printing) and production (JSON).
 * 
 * Usage:
 * - logger.info('Message', { context })
 * - logger.error('Error occurred', { error })
 * - logger.debug('Debug info', { data })
 */
export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  base: {
    env: process.env.NODE_ENV,
  },
});

/**
 * Creates a child logger with additional context.
 * 
 * @param context - Additional context to include in all log messages
 * @returns Child logger instance
 */
export function createLogger(context: Record<string, any>) {
  return logger.child(context);
}

/**
 * Log levels for type safety.
 */
export const LOG_LEVELS = {
  TRACE: 'trace',
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
} as const;

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
