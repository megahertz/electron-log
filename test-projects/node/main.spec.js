'use strict';

var helper = require('../spec-helper');
var TIMEOUT = 6000;

describe('test:projects', function () {
  it('node: check log files', function () {
    return helper.run('node', TIMEOUT).then(function (logReader) {
      expect(logReader.format()).toEqual([
        'main.log: node debug',
        'main.log: node warn'
      ]);
    });
  }, TIMEOUT);
});
