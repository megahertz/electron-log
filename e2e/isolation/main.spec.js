'use strict';

var helper = require('../spec-helper');

var TIMEOUT = 8000;

describe('e2e', function () {
  it('isolation: check log files', function () {
    return helper.run('isolation', TIMEOUT).then(function (logReader) {
      expect(logReader.format()).toEqual([
        'main.log: log from the main process',
        'main.log: log from a renderer process',
      ]);
    });
  }, TIMEOUT);
});
