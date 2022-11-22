'use strict';

const log = require('../index');

describe('index', () => {
  it('should contain all methods of Console API', () => {
    const levels = [
      'error',
      'warn',
      'info',
      'verbose',
      'debug',
      'silly',
      'log',
    ];
    levels.forEach((level) => {
      expect(typeof log[level]).toBe('function');
    });
  });

  it('should allow to add a new log level', () => {
    log.addLevel('notice', 2);
    expect(log.levels).toEqual(
      ['error', 'warn', 'notice', 'info', 'verbose', 'debug', 'silly'],
    );

    expect(typeof log.notice).toBe('function');
    expect(typeof log.functions.notice).toBe('function');
    expect(typeof log.scope('test').notice).toBe('function');
  });

  it('should create independent logger instance', () => {
    const defaultLogger = log;
    const customLogger = log.create('custom');

    customLogger.transports.file.fileName = 'custom.log';

    expect(defaultLogger.transports.file.fileName).toBe('main.log');
    expect(customLogger.transports.file.fileName).toBe('custom.log');
  });
});
