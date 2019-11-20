'use strict';

var index = require('../index');

describe('index', function () {
  it('should contain all methods of Console API', function () {
    var levels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly', 'log'];
    levels.forEach(function (level) {
      expect(typeof index[level]).toBe('function');
    });
  });

  it('should create independent logger instance', function () {
    var defaultLogger = index;
    var customLogger = index.create('custom');

    customLogger.transports.file.fileName = 'custom.log';

    expect(defaultLogger.transports.file.fileName).toBe('main.log');
    expect(customLogger.transports.file.fileName).toBe('custom.log');
  });
});
