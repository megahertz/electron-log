'use strict';

var helper = require('../spec-helper');

var TIMEOUT = 15000;

describe('ipc', function () {
  it('ipc: writes 15 lines to a log file', function () {
    return helper.run('ipc', TIMEOUT).then(function (logs) {
      expect(logs.length).toBe(15);
      expect(logs[0]).toMatch(/{ name: 'Log object in renderer' }/);
      expect(logs[1]).toMatch(/function functionInRenderer\(\)/);
      expect(logs[4]).toMatch(/Error: Error in renderer/);
      expect(logs[6]).toMatch(/{ name: 'Log object in main' }/);
      expect(logs[7]).toMatch(/function functionInMain\(\)/);
      expect(logs[10]).toMatch(/Error: Error in main/);
    });
  }, TIMEOUT);
});
