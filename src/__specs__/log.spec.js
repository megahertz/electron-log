'use strict';

var log = require('../log');

describe('log', function () {
  it('compareLevels', function () {
    var levels = mockElectronLog().levels;

    expect(log.compareLevels(levels, 'error', 'info')).toBe(false);
    expect(log.compareLevels(levels, 'info', 'error')).toBe(true);
    expect(log.compareLevels(levels, 'error', 'error')).toBe(true);
    expect(log.compareLevels(levels, 'error', 'not_exists')).toBe(true);
  });

  describe('log', function () {
    it('should call a transport function', function () {
      var electronLog = mockElectronLog();

      log.log(electronLog, { level: 'info' }, 'test');

      expect(electronLog.journal[0].data).toEqual(['test']);
      expect(electronLog.journal[0].level).toBe('info');
    });

    it('should process undefined value', function () {
      var electronLog = mockElectronLog();
      log.log(electronLog, { level: 'info' }, undefined);

      expect(electronLog.journal[0].data).toEqual([undefined]);
      expect(electronLog.journal[0].level).toBe('info');
    });

    it('should call hooks', function () {
      var electronLog = mockElectronLog();

      electronLog.hooks.push(function (msg) {
        msg.data[0] += ' hooked';
        return msg;
      });

      log.log(electronLog, { level: 'info' }, 'test');

      expect(electronLog.journal[0].data).toEqual(['test hooked']);

      // Should prevent logging
      electronLog.hooks.push(function () {
        return null;
      });

      log.log(electronLog, { level: 'info' }, 'test');

      expect(electronLog.journal.length).toBe(1);
    });

    it('should allow to add new levels', function () {
      var electronLog = mockElectronLog();
      electronLog.levels.push('custom');

      log.log(electronLog, { level: 'custom' }, 'test');
      expect(electronLog.journal.length).toBe(0);

      electronLog.transports.variable.level = 'custom';
      log.log(electronLog, { level: 'custom' }, 'test');
      expect(electronLog.journal.length).toBe(1);
    });
  });

  describe('runTransport', function () {
    it('should run transport when the level is correct', function () {
      var electronLog = mockElectronLog();
      var message = { data: ['test'], level: 'warn' };

      log.runTransport(electronLog.transports.variable, message, electronLog);

      expect(electronLog.journal.length).toBe(1);
    });

    it('should skip running when the transport is broken', function () {
      var electronLog = mockElectronLog();
      var message = { data: ['test'], level: 'warn' };

      log.runTransport({}, message, electronLog);

      expect(electronLog.journal.length).toBe(0);
    });

    it('should skip running when the level is not correct', function () {
      var electronLog = mockElectronLog();
      var message = { data: ['test'], level: 'custom' };

      log.runTransport({}, message, electronLog);

      expect(electronLog.journal.length).toBe(0);
    });
  });
});

function mockElectronLog() {
  var electronLog = {
    hooks: [],
    journal: [],
    levels: ['error', 'warn', 'info', 'verbose', 'debug', 'silly', 'custom'],
    transports: {
      variable: function (msg) { electronLog.journal.push(msg) },
    },
  };

  electronLog.transports.variable.level = 'silly';

  return electronLog;
}
