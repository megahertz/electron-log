'use strict';

var expect = require('chai').expect;
var helper = require('../spec-helper');

describe('node test project', function () {
  this.timeout(6000);
  it('should write 2 lines to a log file', function () {
    return helper.run('node').then(function (logs) {
      expect(logs.length).to.equal(3);
      expect(logs[1]).to.match(/\[[\d-]{10} [\d:.]{12}] \[warn] node warn/);
    });
  });
});
