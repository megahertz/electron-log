'use strict';

var helper = require('../spec-helper');

var TIMEOUT = 6000;

describe('node', function () {
  it('node: writes 2 lines to a log file', function () {
    return helper.run('node', TIMEOUT).then(function (logs) {
      expect(logs.length).toBe(3);
      expect(logs[1]).toMatch(/\[[\d-]{10} [\d:.]{12}] \[warn] node warn/);
    });
  }, TIMEOUT);
});
