'use strict';

var helper = require('../spec-helper');

var TIMEOUT = 20000;

describe('test:projects', function () {
  it('nwjs: check log files', function () {
    return helper.run('nwjs', TIMEOUT).then(function (logReader) {
      expect(logReader.format()).toEqual([
        'main.log: Log from nw.js',
      ]);
    });
  }, TIMEOUT);
});
