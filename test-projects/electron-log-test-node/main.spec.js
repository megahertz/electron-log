'use strict';

const expect = require('chai').expect;
const helper = require('../spec-helper');

const APP_NAME = 'electron-log-test-node';

describe('node test project', () => {
  it('should write one line to a log file', () => {
    return helper.run(APP_NAME).then((logs) => {
      expect(logs.length).to.equal(2);
      expect(logs[0]).to.match(/\[[\d-]{10} [\d:.]{12}] \[warn] node warn/);
    });
  })
});
