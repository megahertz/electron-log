'use strict';

var helper = require('../spec-helper');

var TIMEOUT = 30000;

describe('e2e', function () {
  it('webpack: check log files', function () {
    return helper.run('webpack', TIMEOUT).then(function (logReader) {
      expect(logReader.format()).toEqual([
        'main.log: log from the main process',
        'renderer.log: log from a renderer process',
      ]);
    });
  }, TIMEOUT);
});
