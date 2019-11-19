'use strict';

var helper = require('../spec-helper');

var TIMEOUT = 8000;

describe('test:projects', function () {
  it('simple: check log files', function () {
    return helper.run('simple', TIMEOUT).then(function (logReader) {
      expect(logReader.format()).toEqual([
        'main.log: log from the main process',
        'renderer.log: log from a renderer process',
        'second.log: log from the second renderer process'
      ]);
    });
  }, TIMEOUT);
});
