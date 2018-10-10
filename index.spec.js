'use strict';

var expect = require('chai').expect;
var index  = require('./index');

describe('package', function () {
  it('should contains npm level methods', function () {
    var levels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];
    levels.forEach(function (level) {
      expect(index[level]).to.be.a('function');
    });
  });
});
