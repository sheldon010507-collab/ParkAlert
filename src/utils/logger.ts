const isProd = process.env.NODE_ENV === 'production'

type LogArgs = unknown[]

const serializeArg = (arg: unknown): unknown => {
  if (arg instanceof Error) {
    return {
      name: arg.name,
      message: arg.message,
      stack: arg.stack,
    }
  }

  return arg
}

const writeLog = (level: 'log' | 'warn' | 'error', args: LogArgs) => {
  if (isProd && level === 'log') {
    return
  }

  const serializedArgs = args.map(serializeArg)
  console[level](...serializedArgs)
}

export const logger = {
  log: (...args: LogArgs) => writeLog('log', args),
  warn: (...args: LogArgs) => writeLog('warn', args),
  error: (...args: LogArgs) => writeLog('error', args),
}
