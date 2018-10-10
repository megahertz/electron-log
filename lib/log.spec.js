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


  it('should compare log levels', function () {
    expect(log.compareLevels('error', 'info')).to.be.false;
    expect(log.compareLevels('info', 'error')).to.be.true;
    expect(log.compareLevels('error', 'error')).to.be.true;
    expect(log.compareLevels('error', 'not_exists')).to.be.true;
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
});

function mockElectronLog() {
  var electronLog = {
    hooks: [],
    journal: [],
    transports: {
      variable: function (msg) { electronLog.journal.push(msg) }
    }
  };

  electronLog.transports.variable.level = 'silly';

  return electronLog;
}
