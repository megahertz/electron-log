'use strict';

var expect = require('chai').expect;
var helper = require('../spec-helper');

describe('simple test project', function () {
  this.timeout(8000);

  it('should write 3 lines to a log file', function () {
    return helper.run('simple').then(function (logs) {
      expect(logs.length).to.equal(4);
      expect(logs[0]).to.match(
        /\[[\d-]{10} [\d:.]{12}] \[warn] log from the main process/
      );
      expect(logs[1]).to.match(
        /\[[\d-]{10} [\d:.]{12}] \[warn] log from a renderer process/
      );
      expect(logs[2]).to.match(
        /\[[\d-]{10} [\d:.]{12}] \[warn] log from the second renderer process/
      );
    });
  });
});
