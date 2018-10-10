'use strict';

var expect = require('chai').expect;
var helper = require('../spec-helper');

describe('webpack test project', function () {
  this.timeout(5000);

  it('should write one line to a log file', function () {
    return helper.run('webpack').then(function (logs) {
      expect(logs.length).to.equal(3);
      expect(logs[0]).to.match(
        /\[[\d-]{10} [\d:.]{12}] \[warn] log from the main process/
      );
      expect(logs[1]).to.match(
        /\[[\d-]{10} [\d:.]{12}] \[warn] log from a renderer process/
      );
    });
  });
});
