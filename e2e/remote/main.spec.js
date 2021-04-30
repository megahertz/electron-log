'use strict';

var helper = require('../spec-helper');
var TIMEOUT = 6000;

describe('e2e', function () {
  it('remote: check log files', function () {
    return helper.run('remote', TIMEOUT).then(function (logReader) {
      expect(logReader.format()).toEqual([
        'server.log: Request: Remote logging',
        'server.log: Request: 🐛🐛 UTF8 🐛🐛',
      ]);
    });
  }, TIMEOUT);
});
