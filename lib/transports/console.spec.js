'use strict';

var expect  = require('chai').expect;
var console = require('rewire')('./console');

//noinspection JSUnresolvedFunction
const formatConsole  = console.__get__('formatFn');

describe('console transport', function() {
  var msg = {
    level: 'info',
    data: ['test'],
    date: new Date(2000, 0, 1, 1, 1, 1)
  };

  it('should format console output', function() {
    expect(formatConsole(msg)).to.equals('[01:01:01:000] [info] test');
  });
});
