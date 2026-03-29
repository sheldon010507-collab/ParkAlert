import { logger } from './logger'

describe('logger', () => {
  it('should have all log levels', () => {
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.feature).toBe('function')
  })

  it('should call debug without throwing', () => {
    expect(() => logger.debug('test message')).not.toThrow()
  })

  it('should call info without throwing', () => {
    expect(() => logger.info('test message')).not.toThrow()
  })

  it('should call warn without throwing', () => {
    expect(() => logger.warn('test message')).not.toThrow()
  })

  it('should call error without throwing', () => {
    expect(() => logger.error('test message')).not.toThrow()
  })

  it('should call feature without throwing', () => {
    expect(() => logger.feature('testFeature', 'test message')).not.toThrow()
  })
})
