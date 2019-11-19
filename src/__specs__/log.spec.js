'use strict';

var log = require('../log');

describe('log function', function () {
  it('should call a transport function', function () {
    var electronLog = mockElectronLog();

    log(electronLog, 'info', 'test');

    expect(electronLog.journal[0].data).toEqual(['test']);
    expect(electronLog.journal[0].level).toBe('info');
  });

  it('should process undefined value', function () {
    var electronLog = mockElectronLog();
    log(electronLog, 'info', undefined);

    expect(electronLog.journal[0].data).toEqual([undefined]);
    expect(electronLog.journal[0].level).toBe('info');
  });

  it('should compare log levels', function () {
    var levels = mockElectronLog().levels;

    expect(log.compareLevels(levels, 'error', 'info')).toBe(false);
    expect(log.compareLevels(levels, 'info', 'error')).toBe(true);
    expect(log.compareLevels(levels, 'error', 'error')).toBe(true);
    expect(log.compareLevels(levels, 'error', 'not_exists')).toBe(true);
  });

  it('should call hooks', function () {
    var electronLog = mockElectronLog();

    electronLog.hooks.push(function (msg) {
      msg.data[0] += ' hooked';
      return msg;
    });

    log(electronLog, 'info', 'test');

    expect(electronLog.journal[0].data).toEqual(['test hooked']);

    // Should prevent logging
    electronLog.hooks.push(function () {
      return null;
    });

    log(electronLog, 'info', 'test');

    expect(electronLog.journal.length).toBe(1);
  });

  it('should allow to add new levels', function () {
    var electronLog = mockElectronLog();
    electronLog.levels.push('custom');

    log(electronLog, 'custom', 'test');
    expect(electronLog.journal.length).toBe(0);

    electronLog.transports.variable.level = 'custom';
    log(electronLog, 'custom', 'test');
    expect(electronLog.journal.length).toBe(1);
  });
});

function mockElectronLog() {
  var electronLog = {
    hooks: [],
    journal: [],
    levels: ['error', 'warn', 'info', 'verbose', 'debug', 'silly'],
    transports: {
      variable: function (msg) { electronLog.journal.push(msg) },
    },
  };

  electronLog.transports.variable.level = 'silly';

  return electronLog;
}
