import pino from 'pino';

type LogContext = Record<string, unknown>;

/**
 * Logger interface that accepts (message, context) for all levels.
 * Pino uses (obj, msg?) for merging; we expose (msg, context?) for consistency.
 */
export interface AppLogger {
  trace(msg: string, context?: LogContext): void;
  debug(msg: string, context?: LogContext): void;
  info(msg: string, context?: LogContext): void;
  warn(msg: string, context?: LogContext): void;
  error(msg: string, context?: LogContext): void;
  fatal(msg: string, context?: LogContext): void;
  child(bindings: Record<string, unknown>): AppLogger;
}

const pinoLogger = pino({
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

function wrapPino(log: pino.Logger): AppLogger {
  const logWithContext = (level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal') =>
    (msg: string, context?: LogContext) => {
      if (context && Object.keys(context).length > 0) {
        log[level]({ ...context, msg });
      } else {
        log[level](msg);
      }
    };
  return {
    trace: logWithContext('trace'),
    debug: logWithContext('debug'),
    info: logWithContext('info'),
    warn: logWithContext('warn'),
    error: logWithContext('error'),
    fatal: logWithContext('fatal'),
    child: (bindings) => wrapPino(log.child(bindings)),
  };
}

/**
 * Logger instance using Pino.
 * Configured for development (pretty printing) and production (JSON).
 *
 * Usage:
 * - logger.info('Message', { context })
 * - logger.error('Error occurred', { error })
 * - logger.debug('Debug info', { data })
 */
export const logger: AppLogger = wrapPino(pinoLogger);

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
