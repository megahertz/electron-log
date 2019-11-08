'use strict';

var fs                 = require('fs');
var os                 = require('os');
var path               = require('path');
var factory            = require('../index');
var getExpectedLogPath = require('./findLogPath.spec').getExpectedLogPath;

describe('file transport', function () {
  var tmpId = 'electron-log-' + Math.random().toString(36).substring(2, 15);
  var logFile = path.join(os.tmpdir(), tmpId + '.log');
  var olgLogFile = path.join(os.tmpdir(), tmpId + '.old.log');

  afterEach(function () {
    try {
      fs.unlinkSync(logFile);
      fs.unlinkSync(olgLogFile);
      fs.unlinkSync(getExpectedLogPath('el-test2'));
    } catch (e) {
      // Just skip, after some test file doesn't exist
    }
  });

  it('should archive old log', function () {
    var windowsOverhead = process.platform === 'win32' ? 1 : 0;
    var electronLog = {};
    var msg = {
      data: ['test log'],
      date: new Date(),
      level: 'info',
      variables: electronLog.variables
    };
    var transport = factory(electronLog);
    transport.maxSize = 20;
    transport.file = logFile;
    transport.sync = true;

    transport(msg);
    expect(transport.bytesWritten).toBe(42 + windowsOverhead);
    expect(fs.existsSync(olgLogFile)).toBe(false);

    msg.data = ['test log 2'];
    transport(msg);
    expect(transport.bytesWritten).toBe(44 + windowsOverhead);
    expect(fs.existsSync(olgLogFile)).toBe(true);
    expect(fs.statSync(logFile).size).toBe(44 + windowsOverhead);
    expect(fs.statSync(olgLogFile).size).toBe(42 + windowsOverhead);
  });

  it('should return valid log path depending on OS', function () {
    var electronLog = {};
    var transport = factory(electronLog);
    transport.appName = 'el-test2';

    expect(transport.findLogPath()).toBe(getExpectedLogPath('el-test2'));
  });
});
