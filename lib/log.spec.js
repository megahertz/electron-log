'use strict';

var expect = require('chai').expect;
var log    = require('./log');

describe('log function', function () {
  it('should call a transport function', function () {
    var electronLog = mockElectronLog();

    log(electronLog, 'info', 'test');

    expect(electronLog.journal[0].data).to.deep.equal(['test']);
    expect(electronLog.journal[0].level).to.equal('info');
  });

  it('should process undefined value', function () {
    var electronLog = mockElectronLog();
    log(electronLog, 'info', undefined);

    expect(electronLog.journal[0].data).to.deep.equal([undefined]);
    expect(electronLog.journal[0].level).to.equal('info');
  });

  it('should compare log levels', function () {
    var levels = mockElectronLog().levels;

    expect(log.compareLevels(levels, 'error', 'info')).to.be.false;
    expect(log.compareLevels(levels, 'info', 'error')).to.be.true;
    expect(log.compareLevels(levels, 'error', 'error')).to.be.true;
    expect(log.compareLevels(levels, 'error', 'not_exists')).to.be.true;
  });

  it('should call hooks', function () {
    var electronLog = mockElectronLog();

    electronLog.hooks.push(function (msg) {
      msg.data[0] += ' hooked';
      return msg;
    });

    log(electronLog, 'info', 'test');

    expect(electronLog.journal[0].data).to.deep.equal(['test hooked']);

    // Should prevent logging
    electronLog.hooks.push(function () {
      return null;
    });

    log(electronLog, 'info', 'test');

    expect(electronLog.journal.length).to.equal(1);
  });

  it('should allow to add new levels', function () {
    var electronLog = mockElectronLog();
    electronLog.levels.push('custom');

    log(electronLog, 'custom', 'test');
    expect(electronLog.journal.length).to.equal(0);

    electronLog.transports.variable.level = 'custom';
    log(electronLog, 'custom', 'test');
    expect(electronLog.journal.length).to.equal(1);
  });
});

function mockElectronLog() {
  var electronLog = {
    hooks: [],
    journal: [],
    levels: ['error', 'warn', 'info', 'verbose', 'debug', 'silly'],
    transports: {
      variable: function (msg) { electronLog.journal.push(msg) }
    }
  };

  electronLog.transports.variable.level = 'silly';

  return electronLog;
}
