/**
 * Tiny dependency-free structured (JSON) logger.
 *
 * Emits one JSON object per line. `info`/`debug` go to stdout; `warn`/`error`
 * go to stderr. No secrets, hostnames, or stack traces are added implicitly —
 * callers control exactly what metadata is included.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogMeta = Record<string, unknown>;

export interface Logger {
  debug(message: string, meta?: LogMeta): void;
  info(message: string, meta?: LogMeta): void;
  warn(message: string, meta?: LogMeta): void;
  error(message: string, meta?: LogMeta): void;
}

function write(level: LogLevel, service: string, message: string, meta?: LogMeta): void {
  const entry: Record<string, unknown> = {
    level,
    service,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ?? {}),
  };
  const line = `${JSON.stringify(entry)}\n`;
  if (level === 'error' || level === 'warn') {
    process.stderr.write(line);
  } else {
    process.stdout.write(line);
  }
}

export function createLogger(service: string): Logger {
  return {
    debug: (message, meta) => write('debug', service, message, meta),
    info: (message, meta) => write('info', service, message, meta),
    warn: (message, meta) => write('warn', service, message, meta),
    error: (message, meta) => write('error', service, message, meta),
  };
}
