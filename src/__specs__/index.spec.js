'use strict';

var index = require('../index');

describe('index', function () {
  it('should contain all methods of Console API', function () {
    var levels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly', 'log'];
    levels.forEach(function (level) {
      expect(typeof index[level]).toBe('function');
    });
  });
});
