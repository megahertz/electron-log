'use strict';

var expect = require('chai').expect;
var index  = require('./index');


describe('package', function() {
  var levels = ['error', 'warn', 'info', 'verbose', 'debug', 'silly'];

  it('should contains npm level methods', function() {
    levels.forEach(function (level) {
      expect(index[level]).to.be.a('function');
    });
  });

  it('should contains all log leve methods in named logger', function() {
    var logger = index.createNamedLogger('SomeLogger')
    levels.forEach(function (level) {
      expect(logger[level]).to.be.a('function');
    });
  });

  it('should have distinct config for any named logger', function () {
    var logger = index.createNamedLogger('SomeLogger')
    index.transports.someVal = true
    expect(logger.transports.someVal).be.an('undefined')
    logger.transports.otherVal = 12
    expect(index.transports.otherVal).be.an('undefined')
  });
});