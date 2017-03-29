'use strict';

const expect = require('chai').expect;
const helper = require('../spec-helper');

const APP_NAME = 'electron-log-test-nwjs';

describe('nwjs test project', function() {
  this.timeout(5000);

  it('should write one line to a log file', () => {
    return helper.run(APP_NAME).then((logs) => {
      expect(logs[0]).to.match(/\[[\d-]{10} [\d:]{13}] \[warn] Log from nw.js/);
    });
  })
});