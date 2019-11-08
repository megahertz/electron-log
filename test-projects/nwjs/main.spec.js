'use strict';

var helper = require('../spec-helper');

var TIMEOUT = 20000;

describe('nwjs', function () {
  it('nwjs: writes one line to a log file', function () {
    return helper.run('nwjs', TIMEOUT).then(function (logs) {
      expect(logs.length).toBe(2);
      expect(logs[0]).toMatch(/\[[\d-]{10} [\d:.]{12}] \[warn] Log from nw/);
    });
  }, TIMEOUT);
});
