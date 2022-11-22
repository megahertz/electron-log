'use strict';

const { expect } = require('humile');
const Logger = require('../Logger');

describe('Logger', () => {
  it('compareLevels', () => {
    const log = createLogger();
    expect(log.compareLevels('error', 'info')).toBe(false);
    expect(log.compareLevels('info', 'error')).toBe(true);
    expect(log.compareLevels('error', 'error')).toBe(true);
    expect(log.compareLevels('error', 'not_exists')).toBe(true);
  });

  describe('log', () => {
    it('should call a transport function', () => {
      const log = createLogger();
      log.info('test');
      expect(log.memory[0]).toMatchObject({ data: ['test'], level: 'info' });
    });

    it('should process undefined value', () => {
      const log = createLogger();
      log.info(undefined);
      expect(log.memory[0]).toMatchObject({ data: [undefined], level: 'info' });
    });

    it('should call hooks', () => {
      const log = createLogger();

      log.hooks.push((msg) => {
        msg.data[0] += ' hooked';
        return msg;
      });

      log.info('test');
      expect(log.memory[0].data).toEqual(['test hooked']);

      // Should prevent logging
      log.hooks.push(() => null);
      log.info('test');
      expect(log.memory.length).toBe(1);
    });

    it('should allow to add new levels', () => {
      const log = createLogger();
      log.addLevel('custom');
      // noinspection JSUnresolvedFunction
      log.custom('test');
      expect(log.memory[0]).toMatchObject({ data: ['test'], level: 'custom' });
    });
  });

  describe('processMessage', () => {
    it('should run transport when the level is correct', () => {
      const log = createLogger();
      log.processMessage({ data: ['test'], level: 'warn' });
      expect(log.memory.length).toBe(1);
    });

    it('should skip running when the transport is broken', () => {
      const log = createLogger({ transportFactories: {} });
      log.processMessage({ data: ['test'], level: 'info' });
      expect(log.memory.length).toBe(0);
    });
  });
});

function createLogger(options = {}) {
  const logger = new Logger({
    logId: 'logger-test',
    transportFactories: {
      memory: (log) => {
        return (message) => log.memory.push(message);
      },
    },
    ...options,
  });

  logger.memory = [];

  return logger;
}
