'use strict';

var helper = require('../spec-helper');

var TIMEOUT = 8000;

describe('simple', function () {
  it('simple: writes 3 lines to a log file', function () {
    return helper.run('simple', TIMEOUT).then(function (logs) {
      expect(logs.length).toBe(4);
      expect(logs[0]).toMatch(
        /\[[\d-]{10} [\d:.]{12}] \[warn] log from the main process/
      );
      expect(logs[1]).toMatch(
        /\[[\d-]{10} [\d:.]{12}] \[warn] log from a renderer process/
      );
      expect(logs[2]).toMatch(
        /\[[\d-]{10} [\d:.]{12}] \[warn] log from the second renderer process/
      );
    });
  }, TIMEOUT);
});
