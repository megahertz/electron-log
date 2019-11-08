'use strict';

var helper = require('../spec-helper');

var TIMEOUT = 30000;

describe('webpack', function () {
  it('webpack: writes one line to a log file', function () {
    return helper.run('webpack', TIMEOUT).then(function (logs) {
      expect(logs.length).toBe(3);
      expect(logs[0]).toMatch(
        /\[[\d-]{10} [\d:.]{12}] \[warn] log from the main process/
      );
      expect(logs[1]).toMatch(
        /\[[\d-]{10} [\d:.]{12}] \[warn] log from a renderer process/
      );
    });
  }, TIMEOUT);
});
