'use strict';

var expect = require('chai').expect;
var helper = require('../spec-helper');

describe('nwjs test project', function () {
  this.timeout(10000);

  it('should write one line to a log file', function () {
    return helper.run('nwjs').then(function (logs) {
      expect(logs.length).to.equal(2);
      expect(logs[0]).to.match(/\[[\d-]{10} [\d:.]{12}] \[warn] Log from nw/);
    });
  });
});
