/**
 * Logger utility - wraps console.log with environment-aware logging
 * In production, logs are suppressed unless explicitly enabled
 */

const isDevelopment = __DEV__

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLevel = isDevelopment ? 'debug' : 'warn'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) {
      console.log('[DEBUG]', ...args)
    }
  },
  
  info: (...args: unknown[]) => {
    if (shouldLog('info')) {
      console.log('[INFO]', ...args)
    }
  },
  
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) {
      console.warn('[WARN]', ...args)
    }
  },
  
  error: (...args: unknown[]) => {
    if (shouldLog('error')) {
      console.error('[ERROR]', ...args)
    }
  },
  
  // For debugging specific features - remove in production
  feature: (feature: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.log(`[${feature}]`, ...args)
    }
  },
}

export default logger
