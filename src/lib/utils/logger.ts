type LogContext = Record<string, unknown>;

/**
 * Logger interface that accepts (message, context) for all levels.
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

// Use console-based logging to avoid pino-pretty worker thread issues in Next.js dev.
// In production, structured JSON logging is handled by the platform (Vercel/etc).
function makeLogger(bindings: Record<string, unknown> = {}): AppLogger {
  const format = (level: string, msg: string, context?: LogContext) => {
    if (process.env.NODE_ENV === 'production') {
      const entry = { level, msg, ...bindings, ...context };
      console.log(JSON.stringify(entry));
    } else {
      const prefix = `[${level.toUpperCase()}] ${msg}`;
      const extra = { ...bindings, ...context };
      if (Object.keys(extra).length > 0) {
        console.log(prefix, extra);
      } else {
        console.log(prefix);
      }
    }
  };
  return {
    trace: (msg, ctx) => format('trace', msg, ctx),
    debug: (msg, ctx) => format('debug', msg, ctx),
    info: (msg, ctx) => format('info', msg, ctx),
    warn: (msg, ctx) => format('warn', msg, ctx),
    error: (msg, ctx) => format('error', msg, ctx),
    fatal: (msg, ctx) => format('fatal', msg, ctx),
    child: (b) => makeLogger({ ...bindings, ...b }),
  };
}

/**
 * Logger instance.
 * Development: colorized console output.
 * Production: JSON to stdout.
 *
 * Usage:
 * - logger.info('Message', { context })
 * - logger.error('Error occurred', { error })
 * - logger.debug('Debug info', { data })
 */
export const logger: AppLogger = makeLogger();

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
